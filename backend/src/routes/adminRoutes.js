import prisma from '../lib/prisma.js'
import csv from 'csv-parser'
import bcrypt from 'bcrypt'

async function generateNewStudents(batchId, startRegNo, endRegNo) {
    const prefixMatch = startRegNo.match(/^(.*[_/])(\d+)$/);
    const endMatch = endRegNo.match(/^(.*[_/])(\d+)$/);
    
    if (prefixMatch && endMatch && prefixMatch[1] === endMatch[1]) {
        const prefix = prefixMatch[1];
        const start = parseInt(prefixMatch[2], 10);
        const end = parseInt(endMatch[2], 10);
        
        const allRegNos = [];
        for (let i = start; i <= end; i++) {
            allRegNos.push(`${prefix}${i}`);
        }
        
        const existing = await prisma.student.findMany({
            where: { regNo: { in: allRegNos } },
            select: { regNo: true }
        });
        const existingSet = new Set(existing.map(s => s.regNo));
        const newRegNos = allRegNos.filter(r => !existingSet.has(r));
        
        const promises = newRegNos.map(async (regNo) => {
            const plainPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(plainPassword, 6); // Reduced for faster bulk generation
            return {
                student: { regNo, batchId, password: hashedPassword },
                plain: { regNo, password: plainPassword }
            };
        });
        
        const results = await Promise.all(promises);
        return {
            students: results.map(r => r.student),
            plainPasswords: results.map(r => r.plain)
        };
    }
    return { students: [], plainPasswords: [] };
}

export async function adminRoutes(fastify, options) {
  
  // 1. Create a Batch
  fastify.post('/batches', async (request, reply) => {
    const { name, startRegNo, endRegNo } = request.body;
    try {
      const batch = await prisma.batch.create({
        data: { name, startRegNo, endRegNo }
      });
      
      const { students, plainPasswords } = await generateNewStudents(batch.id, startRegNo, endRegNo);
      if (students.length > 0) {
          await prisma.student.createMany({
              data: students,
              skipDuplicates: true
          });
      }
      
      const responseBatch = { ...batch, newStudentPasswords: plainPasswords };
      return reply.code(201).send(responseBatch);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return reply.code(400).send({ error: 'A batch with this name already exists.' });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create batch' });
    }
  });

  // 1.5 Update a Batch
  fastify.put('/batches/:batchId', async (request, reply) => {
    const { batchId } = request.params;
    const { name, startRegNo, endRegNo } = request.body;
    try {
      const batch = await prisma.batch.update({
        where: { id: batchId },
        data: { name, startRegNo, endRegNo }
      });
      
      const { students, plainPasswords } = await generateNewStudents(batch.id, startRegNo, endRegNo);
      if (students.length > 0) {
          await prisma.student.createMany({
              data: students,
              skipDuplicates: true
          });
      }
      
      const responseBatch = { ...batch, newStudentPasswords: plainPasswords };
      return reply.send(responseBatch);
    } catch (error) {
      if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
        return reply.code(400).send({ error: 'A batch with this name already exists.' });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update batch' });
    }
  });

  // 1.6 Delete a Batch
  fastify.delete('/batches/:batchId', async (request, reply) => {
    const { batchId } = request.params;
    try {
      await prisma.batch.delete({
        where: { id: batchId }
      });
      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete batch' });
    }
  });

  // 2. Get all Batches
  fastify.get('/batches', async (request, reply) => {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return batches;
  });

  // 2.5 Upload Department Allocation CSV (Specific Dept)
  fastify.post('/batches/:batchId/departments/:department/upload', async (request, reply) => {
    const { batchId, department } = request.params;
    const data = await request.file();
    
    if (!data) return reply.code(400).send({ error: 'No file uploaded' });

    const regNos = [];
    
    for await (const chunk of data.file.pipe(csv({ headers: false }))) {
      let regNo = null;
      for (const val of Object.values(chunk)) {
        if (typeof val === 'string') {
          const match = val.match(/(EG[_/]\d+[_/]\d+)/i);
          if (match) {
            regNo = match[1].toUpperCase().replace(/_/g, '/');
            break;
          }
        }
      }

      if (regNo) {
        regNos.push(regNo);
      }
    }

    try {
      // Find students who are already allocated to a DIFFERENT department
      const alreadyAllocated = await prisma.student.findMany({
        where: {
          regNo: { in: regNos },
          batchId,
          departmentId: { not: 'GENERAL' }
        },
        select: { regNo: true, departmentId: true }
      });

      const allocatedSet = new Set(alreadyAllocated.map(s => s.regNo));
      const validRegNos = regNos.filter(r => !allocatedSet.has(r));

      const updateResult = await prisma.student.updateMany({
        where: { regNo: { in: validRegNos }, batchId },
        data: { departmentId: department.toUpperCase() }
      });
      
      let message = 'Students allocated successfully.';
      if (alreadyAllocated.length > 0) {
        message = `Allocated ${updateResult.count} students. Skipped ${alreadyAllocated.length} students who were already assigned to another department.`;
      }

      return reply.send({ success: true, count: updateResult.count, message, skipped: alreadyAllocated.length });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to allocate students' });
    }
  });

  // 3. Add a Module
  fastify.post('/modules', async (request, reply) => {
    let { code, name, type, semester, department, isGpa } = request.body;
    code = code.trim().toUpperCase().replace(/^([A-Z]+)\s*(\d+)$/, '$1 $2');
    
    // Extract credits: 2nd digit of the numbers (e.g. EE 3201 -> 2 credits)
    const match = code.match(/[A-Z]+\s*\d(\d)\d\d/);
    const credits = match ? parseInt(match[1]) : 3;
    
    const deptId = department || 'GENERAL';

    if (deptId === 'COMPUTER' && !code.startsWith('EC')) {
      return reply.code(400).send({ error: 'Computer Engineering module codes must start with EC' });
    }
    if (deptId === 'MECHANICAL' && !code.startsWith('ME')) {
      return reply.code(400).send({ error: 'Mechanical Engineering module codes must start with ME' });
    }
    if (deptId === 'ELECTRICAL' && !code.startsWith('EE')) {
      return reply.code(400).send({ error: 'Electrical Engineering module codes must start with EE' });
    }
    if (deptId === 'CIVIL' && !code.startsWith('CE')) {
      return reply.code(400).send({ error: 'Civil Engineering module codes must start with CE' });
    }

    try {
      const module = await prisma.module.create({
        data: { code, name, type, semester: parseInt(semester), departmentId: deptId, credits, isGpa: isGpa === undefined ? true : isGpa }
      });
      return reply.code(201).send(module);
    } catch (error) {
      if (error.code === 'P2002') {
        return reply.code(400).send({ error: 'A module with this code already exists.' });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to add module' });
    }
  });

  // 4. Get Modules by Semester & Department
  fastify.get('/modules/:semester/departments/:department', async (request, reply) => {
    const { semester, department } = request.params;
    const { batchId } = request.query;

    const deptUpper = department.toUpperCase();

    try {
      const modules = await prisma.module.findMany({
        where: { 
          semester: parseInt(semester),
          departmentId: deptUpper === 'GENERAL' 
            ? 'GENERAL' 
            : { in: [deptUpper, 'GENERAL'] }
        },
        include: {
          _count: { 
            select: { 
              results: {
                where: {
                  ...(batchId ? { student: { batchId } } : {}),
                  ...(deptUpper !== 'GENERAL' ? { departmentId: deptUpper } : {})
                }
              }
            } 
          },
          results: {
            where: {
              ...(batchId ? { student: { batchId } } : {}),
              ...(deptUpper !== 'GENERAL' ? { departmentId: deptUpper } : {})
            },
            take: 1, 
            select: { isPublished: true } 
          }
        },
        orderBy: { code: 'asc' }
      });
      
      return modules.map(m => {
        let status = 'NO_RESULTS';
        if (m._count.results > 0) {
          status = m.results[0]?.isPublished ? 'PUBLISHED' : 'DRAFT';
        }
        return {
          code: m.code,
          name: m.name,
          type: m.type,
          isGpa: m.isGpa,
          semester: m.semester,
          department: m.departmentId,
          status,
          resultCount: m._count.results
        };
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch modules' });
    }
  });

  // 4.5 Update Module
  fastify.put('/modules/:code', async (request, reply) => {
    const { code } = request.params;
    const { name, type, isGpa } = request.body;
    try {
      const module = await prisma.module.update({
        where: { code },
        data: { name, type, isGpa: isGpa === undefined ? true : isGpa }
      });
      return reply.send(module);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update module' });
    }
  });

  // 5. Delete Module
  fastify.delete('/modules/:code', async (request, reply) => {
    const { code } = request.params;
    try {
      // With Cascade onDelete on the Module relation in Result,
      // deleting the module automatically deletes all its results.
      await prisma.module.delete({ where: { code } });
      return reply.send({ success: true });
    } catch (error) {
      return reply.code(500).send({ error: 'Failed to delete module' });
    }
  });

  // 6. Upload Results via CSV
  fastify.post('/modules/:code/results/upload', async (request, reply) => {
    const { code } = request.params;
    const { batchId, isRepeatUpload } = request.query;
    const data = await request.file();
    
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const results = [];
    
    for await (const chunk of data.file.pipe(csv({
      mapHeaders: ({ header }) => header.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    }))) {
      let regNo = null;
      // Search all columns for a valid Registration Number pattern
      for (const val of Object.values(chunk)) {
        if (typeof val === 'string') {
          const match = val.match(/(EG[_/]\d+[_/]\d+)/i);
          if (match) {
            regNo = match[1].toUpperCase().replace(/_/g, '/');
            break;
          }
        }
      }

      const grade = chunk.grade || chunk.result || chunk.marks || chunk.mark;

      let isGpa = null;
      const statusStr = chunk.status || chunk.type || chunk.gpa || chunk.category || chunk.ngaorgpa || chunk.ngpaorgpa || chunk.nga || chunk.ngpa;
      if (statusStr) {
          const s = statusStr.trim().toUpperCase();
          if (s === 'NGPA' || s === 'NGA') isGpa = false;
          else if (s === 'GPA') isGpa = true;
      }

      if (regNo && grade) {
        results.push({
          studentRegNo: regNo,
          moduleCode: code,
          grade: grade.trim(),
          isGpa,
          isPublished: false
        });
      }
    }

    if (results.length === 0) {
      return reply.code(400).send({ error: 'No valid data found in CSV. Ensure Grade column exists.' });
    }

    try {
      // Get the module to inherit its department
      const module = await prisma.module.findUnique({ where: { code } });
      const moduleDept = module ? module.departmentId : 'GENERAL';

      const studentRegNos = results.map(r => r.studentRegNo);
      
      // Batch fetch students
      const students = await prisma.student.findMany({
        where: { regNo: { in: studentRegNos } }
      });
      const studentMap = new Map(students.map(s => [s.regNo, s]));
      
      // Batch fetch existing results for repeats
      const existingResults = await prisma.result.findMany({
        where: {
          moduleCode: code,
          studentRegNo: { in: studentRegNos }
        }
      });
      const resultMap = new Map(existingResults.map(r => [r.studentRegNo, r]));
      
      const operations = [];

      // Properly handle string 'undefined' from URL query
      const parsedBatchId = (batchId === 'undefined' || !batchId) ? null : batchId;

      for (const res of results) {
        const studentExists = studentMap.get(res.studentRegNo);
        if (!studentExists) {
            continue; // Skip upload for students that are not registered in any batch
        }

        const isRepeat = (isRepeatUpload === 'true') || (parsedBatchId && studentExists.batchId !== parsedBatchId);

        let previousGrade = null;
        if (isRepeat) {
          const existingResult = resultMap.get(res.studentRegNo);
          if (existingResult && existingResult.grade) {
            previousGrade = existingResult.grade;
          } else {
            // Defaulting to F if previous grade doesn't exist but it's marked as repeat
            previousGrade = 'F';
          }
        }

        // Determine the result's department.
        // Use the student's allocated department, fallback to the module's department
        const resultDept = studentExists.departmentId || moduleDept;

        if (previousGrade) {
          operations.push(
            prisma.result.update({
              where: {
                studentRegNo_moduleCode: {
                  studentRegNo: res.studentRegNo,
                  moduleCode: res.moduleCode
                }
              },
              data: { grade: res.grade, previousGrade, isPublished: false, departmentId: resultDept, isRepeat, isGpa: res.isGpa }
            })
          );
        } else {
          operations.push(
            prisma.result.upsert({
              where: {
                studentRegNo_moduleCode: {
                  studentRegNo: res.studentRegNo,
                  moduleCode: res.moduleCode
                }
              },
              update: { grade: res.grade, isPublished: false, departmentId: resultDept, isRepeat, isGpa: res.isGpa },
              create: { ...res, departmentId: resultDept, isRepeat, isGpa: res.isGpa }
            })
          );
        }
      }
      
      // Execute in chunks to prevent transaction hanging or deadlock
      const chunkSize = 100;
      for (let i = 0; i < operations.length; i += chunkSize) {
        await prisma.$transaction(operations.slice(i, i + chunkSize));
      }
      
      return reply.send({ success: true, count: results.length });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to save results. The upload might have timed out or hit a constraint error.' });
    }
  });

  // 7. Get Results for Module
  fastify.get('/modules/:code/results', async (request, reply) => {
    const { code } = request.params;
    const { department } = request.query;
    
    const module = await prisma.module.findUnique({ where: { code } });
    if (!module) return [];
    
    const whereClause = { moduleCode: code };
    if (department && department.toUpperCase() !== 'GENERAL') {
      whereClause.departmentId = department.toUpperCase();
    }

    const results = await prisma.result.findMany({
      where: whereClause,
      include: { student: true },
      orderBy: { studentRegNo: 'asc' }
    });
    return results;
  });

  // 8. Publish Results
  fastify.post('/modules/:code/results/publish', async (request, reply) => {
    const { code } = request.params;
    try {
      // Find all results for this module that are about to be published
      const resultsToPublish = await prisma.result.findMany({
        where: { moduleCode: code, isPublished: false }
      });

      // Update them to published
      await prisma.result.updateMany({
        where: { moduleCode: code },
        data: { isPublished: true }
      });

      // Create a notification for each student who has notifications enabled
      if (resultsToPublish.length > 0) {
        const regNos = [...new Set(resultsToPublish.map(r => r.studentRegNo))];
        const optedOut = await prisma.student.findMany({
          where: { regNo: { in: regNos }, notificationsEnabled: false },
          select: { regNo: true }
        });
        const optedOutSet = new Set(optedOut.map(s => s.regNo));

        const notifications = resultsToPublish
          .filter(r => !optedOutSet.has(r.studentRegNo))
          .map(r => ({
            studentRegNo: r.studentRegNo,
            title: r.isRepeat ? 'Repeat Results Published' : 'New Results Published',
            message: r.isRepeat 
              ? `Your repeat results for module ${code} have been released.`
              : `Your results for module ${code} have been released.`
          }));

        if (notifications.length > 0) {
          await prisma.notification.createMany({
            data: notifications,
            skipDuplicates: true
          });
        }
      }

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to publish results' });
    }
  });

  // 8.1 Unpublish Results
  fastify.post('/modules/:code/results/unpublish', async (request, reply) => {
    const { code } = request.params;
    try {
      await prisma.result.updateMany({
        where: { moduleCode: code },
        data: { isPublished: false }
      });

      // Delete the notifications related to this module's results
      await prisma.notification.deleteMany({
        where: { message: { contains: `module ${code}` } }
      });

      return reply.send({ success: true });
    } catch (error) {
      return reply.code(500).send({ error: 'Failed to unpublish results' });
    }
  });

  // 8.5 Get Department Stats
  fastify.get('/batches/:batchId/departments/:department/stats', async (request, reply) => {
    const { batchId, department } = request.params;
    try {
      let whereClause = { batchId };
      if (department.toUpperCase() !== 'GENERAL') {
        whereClause.departmentId = department.toUpperCase();
      }
      
      const studentCount = await prisma.student.count({
        where: whereClause
      });
      return { studentCount };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch department stats' });
    }
  });

  // 9. Get Master Result Sheet (Pivoted Data)
  fastify.get('/batches/:batchId/semesters/:semester/departments/:department/master-sheet', async (request, reply) => {
    const { batchId, semester, department } = request.params;
    
    // Grading scale helper
    const getGradePoint = (grade) => {
      if (!grade) return null;
      const g = grade.trim().toUpperCase();
      const scale = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 
        'E': 0.0, 'F': 0.0, 'AB': 0.0
      };
      // For repeat modules capped at C (2.0)
      if (g.includes('*')) {
        const rawGrade = g.replace('*', '');
        return scale[rawGrade] !== undefined ? Math.min(scale[rawGrade], 2.0) : null;
      }
      return scale[g] !== undefined ? scale[g] : null;
    };

    try {
      let studentWhere = { batchId };
      if (department.toUpperCase() !== 'GENERAL') {
        studentWhere.departmentId = department.toUpperCase();
      }

      const students = await prisma.student.findMany({
        where: studentWhere,
        orderBy: { regNo: 'asc' }
      });
      
      // Modules for the current requested semester
      const modules = await prisma.module.findMany({
        where: { 
          semester: parseInt(semester),
          departmentId: department.toUpperCase() === 'GENERAL' 
            ? 'GENERAL' 
            : { in: [department.toUpperCase(), 'GENERAL'] }
        },
        orderBy: { code: 'asc' }
      });
      
      // We need ALL modules up to the current semester to calculate CGPA
      const allModules = await prisma.module.findMany({
        where: {
          semester: { lte: parseInt(semester) },
          departmentId: department.toUpperCase() === 'GENERAL' 
            ? 'GENERAL' 
            : { in: [department.toUpperCase(), 'GENERAL'] }
        }
      });
      
      const allModuleMap = new Map(allModules.map(m => [m.code, m]));

      // Fetch ALL results for these students up to current semester
      const allResults = await prisma.result.findMany({
        where: {
          studentRegNo: { in: students.map(s => s.regNo) },
          moduleCode: { in: allModules.map(m => m.code) }
        }
      });

      const pivotData = students.map(student => {
        const studentRow = { regNo: student.regNo, department: student.departmentId };
        
        // Populate specific semester module grades
        modules.forEach(m => {
          const result = allResults.find(r => r.studentRegNo === student.regNo && r.moduleCode === m.code);
          if (result) {
              let gradeDisplay = result.isRepeat ? `${result.grade}*` : result.grade;
              const appliesToGpa = result.isGpa !== null ? result.isGpa : (m.isGpa !== false);
              if (!appliesToGpa) {
                  gradeDisplay += ' (NGPA)';
              }
              studentRow[m.code] = gradeDisplay;
          } else {
              studentRow[m.code] = '-';
          }
        });

        // Calculate SGPA (only modules from THIS semester)
        let semPoints = 0;
        let semCredits = 0; // GPA denominator
        
        // Calculate CGPA (all modules up to this semester)
        let cumPoints = 0;
        let cumCredits = 0; // GPA denominator
        
        let totalEarnedCredits = 0;

        const studentResults = allResults.filter(r => r.studentRegNo === student.regNo);
        
        studentResults.forEach(r => {
          const mod = allModuleMap.get(r.moduleCode);
          if (!mod) return;
          
          const gradeStr = r.isRepeat ? `${r.grade}*` : r.grade;
          const gp = getGradePoint(gradeStr);
          
          if (gp !== null) {
            const rawGrade = gradeStr.replace('*', '').trim().toUpperCase();
            const isPass = gp > 0 || ['A+','A','A-','B+','B','B-','C+','C','C-','D+','D', 'P', 'S'].includes(rawGrade);

            if (isPass) {
                totalEarnedCredits += mod.credits;
            }

            const appliesToGpa = r.isGpa !== null ? r.isGpa : (mod.isGpa !== false);

            if (appliesToGpa) {
                const points = gp * mod.credits;
                
                // CGPA contribution
                cumPoints += points;
                cumCredits += mod.credits;

                // SGPA contribution
                if (mod.semester === parseInt(semester)) {
                  semPoints += points;
                  semCredits += mod.credits;
                }
            }
          }
        });

        studentRow.sgpa = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '0.00';
        studentRow.cgpa = cumCredits > 0 ? (cumPoints / cumCredits).toFixed(2) : '0.00';
        studentRow.totalCredits = totalEarnedCredits;

        return studentRow;
      });
      
      return { modules, pivotData };
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to generate master sheet' });
    }
  });

  // 10. Create Examiner
  fastify.post('/examiners', async (request, reply) => {
    const { email, name, departmentId } = request.body;
    try {
      const examiner = await prisma.examiner.create({
        data: { email, name, isRegistered: false, departmentId: departmentId || 'GENERAL' }
      });
      return reply.code(201).send({ email: examiner.email, name: examiner.name });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create examiner' });
    }
  });

  // 11. Get Examiners
  fastify.get('/examiners', async (request, reply) => {
    try {
      const examiners = await prisma.examiner.findMany({
        select: { email: true, name: true, departmentId: true, createdAt: true }
      });
      return examiners;
    } catch (error) {
      return reply.code(500).send({ error: 'Failed to fetch examiners' });
    }
  });

  // 12. Create Exam Schedule
  fastify.post('/exam-schedules', async (request, reply) => {
    const { moduleCode, examinerEmail, date, venue } = request.body;
    try {
      const schedule = await prisma.examSchedule.create({
        data: { moduleCode, examinerEmail, date: new Date(date), venue }
      });

      // Send notification to examiner
      await prisma.examinerNotification.create({
        data: {
          examinerEmail,
          title: 'New Exam Duty Assigned',
          message: `You have been assigned to ${moduleCode} on ${new Date(date).toLocaleDateString()} at ${venue}.`
        }
      });

      return reply.code(201).send(schedule);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create exam schedule' });
    }
  });

  // 12.5 Update Exam Schedule
  fastify.put('/exam-schedules/:id', async (request, reply) => {
    const { id } = request.params;
    const { moduleCode, examinerEmail, date, venue } = request.body;
    try {
      const schedule = await prisma.examSchedule.update({
        where: { id },
        data: { moduleCode, examinerEmail, date: new Date(date), venue }
      });
      return reply.send(schedule);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update exam schedule' });
    }
  });

  // 12.6 Delete Exam Schedule
  fastify.delete('/exam-schedules/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      await prisma.examSchedule.delete({ where: { id } });
      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete exam schedule' });
    }
  });

  // 13. Get Exam Schedules
  fastify.get('/exam-schedules', async (request, reply) => {
    try {
      const schedules = await prisma.examSchedule.findMany({
        include: { module: true, examiner: { select: { name: true, email: true } } },
        orderBy: { date: 'asc' }
      });
      return schedules;
    } catch (error) {
      return reply.code(500).send({ error: 'Failed to fetch exam schedules' });
    }
  });
}
