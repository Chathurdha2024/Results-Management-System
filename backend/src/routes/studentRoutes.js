import prisma from '../lib/prisma.js';
export async function studentRoutes(fastify, options) {
  // GET /api/student/dashboard
  fastify.get('/dashboard', async (request, reply) => {
    // Rely on JWT token verification hook mapped to this prefix
    const { role, regNo } = request.user;

    if (role !== 'STUDENT' || !regNo) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

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
      if (g.includes('*')) {
        const rawGrade = g.replace('*', '');
        return scale[rawGrade] !== undefined ? Math.min(scale[rawGrade], 2.0) : null;
      }
      return scale[g] !== undefined ? scale[g] : null;
    };

    try {
      // 1. Fetch student info
      const student = await prisma.student.findUnique({
        where: { regNo },
        include: { department: true }
      });

      if (!student) {
        return reply.code(404).send({ error: 'Student not found' });
      }

      // 2 & 3. Fetch modules and results in parallel for performance
      const [modules, results] = await Promise.all([
        prisma.module.findMany({
          where: {
            OR: [
              { departmentId: student.departmentId },
              { departmentId: 'GENERAL' }
            ]
          },
          orderBy: { semester: 'asc' }
        }),
        prisma.result.findMany({ where: { studentRegNo: regNo } })
      ]);

      // Convert results to a quick lookup map
      const resultMap = {};
      results.forEach(res => {
        resultMap[res.moduleCode] = res;
      });

      // 4. Format response grouping by semester and compute GPAs
      const semesters = {};
      const sgpaBySemester = {};
      
      let cgpaPoints = 0;
      let cgpaCredits = 0;

      modules.forEach(mod => {
        const sem = mod.semester;
        if (!semesters[sem]) {
          semesters[sem] = [];
          sgpaBySemester[sem] = { points: 0, credits: 0, publishedCount: 0, moduleCount: 0 };
        }
        sgpaBySemester[sem].moduleCount++;

        const result = resultMap[mod.code];
        
        let grade = '-';
        let status = 'PENDING';
        let releasedAt = null;
        let isRepeat = false;
        let previousGrade = null;
        
        if (result) {
          isRepeat = result.isRepeat;
          previousGrade = result.previousGrade;
          if (result.isPublished) {
            grade = result.grade;
            status = 'RELEASED';
            releasedAt = result.updatedAt;
            
            // Only calculate GPA if published
            const gradeStr = isRepeat ? `${grade}*` : grade;
            const gp = getGradePoint(gradeStr);
            if (gp !== null) {
              sgpaBySemester[sem].publishedCount++;
              
              const appliesToGpa = result.isGpa !== null ? result.isGpa : (mod.isGpa !== false);

              if (appliesToGpa) {
                const points = gp * mod.credits;
                
                sgpaBySemester[sem].points += points;
                sgpaBySemester[sem].credits += mod.credits;
                
                cgpaPoints += points;
                cgpaCredits += mod.credits;
              }
            }
          }
        }

        semesters[sem].push({
          code: mod.code,
          name: mod.name,
          type: mod.type,
          isGpa: result ? (result.isGpa !== null ? result.isGpa : mod.isGpa !== false) : mod.isGpa !== false,
          credits: mod.credits,
          grade,
          previousGrade,
          status,
          releasedAt,
          isRepeat
        });
      });

      // Format SGPA values
      const formattedSgpa = {};
      Object.keys(sgpaBySemester).forEach(sem => {
        const s = sgpaBySemester[sem];
        if (s.publishedCount === 0) {
          formattedSgpa[sem] = null; // No published results yet
        } else {
          formattedSgpa[sem] = s.credits > 0 ? (s.points / s.credits).toFixed(2) : '0.00';
        }
      });

      const formattedCgpa = cgpaCredits > 0 ? (cgpaPoints / cgpaCredits).toFixed(2) : null;

      return reply.send({
        student: {
          regNo: student.regNo,
          department: student.department.name,
          batchId: student.batchId
        },
        resultsBySemester: semesters,
        sgpaBySemester: formattedSgpa,
        cgpa: formattedCgpa
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch student dashboard data' });
    }
  });

  // GET /api/student/notifications
  fastify.get('/notifications', async (request, reply) => {
    const { role, regNo } = request.user;
    if (role !== 'STUDENT' || !regNo) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    try {
      const notifications = await prisma.notification.findMany({
        where: { studentRegNo: regNo },
        orderBy: { createdAt: 'desc' }
      });
      return notifications;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch notifications' });
    }
  });

  // POST /api/student/notifications/read
  fastify.post('/notifications/read', async (request, reply) => {
    const { role, regNo } = request.user;
    if (role !== 'STUDENT' || !regNo) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    try {
      await prisma.notification.updateMany({
        where: { studentRegNo: regNo, isRead: false },
        data: { isRead: true }
      });
      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to mark notifications as read' });
    }
  });

  // GET /api/student/exam-schedules
  fastify.get('/exam-schedules', async (request, reply) => {
    const { role, regNo } = request.user;
    if (role !== 'STUDENT' || !regNo) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
    try {
      const student = await prisma.student.findUnique({
        where: { regNo },
        select: { departmentId: true }
      });

      if (!student) return reply.code(404).send({ error: 'Student not found' });

      const schedules = await prisma.examSchedule.findMany({
        where: {
          module: {
            OR: [
              { departmentId: student.departmentId },
              { departmentId: 'GENERAL' }
            ]
          }
        },
        include: {
          module: {
            select: { name: true, code: true, type: true, semester: true }
          }
        },
        orderBy: { date: 'asc' }
      });
      return schedules;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch exam schedules' });
    }
  });
}
