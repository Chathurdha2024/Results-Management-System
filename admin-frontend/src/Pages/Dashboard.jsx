const stats = [
  { label: 'Active Programs', value: 8 },
  { label: 'Registered Students', value: 1520 },
  { label: 'Modules Offered', value: 230 },
  { label: 'Upcoming Exams', value: 24 },
  { label: 'Pending Result Validations', value: 37 },
  { label: 'Average GPA (This Semester)', value: '3.12' },
]

const recentExams = [
  {
    code: 'ME4012',
    title: 'Machine Design II',
    program: 'Mechanical Engineering',
    date: '2026-03-12',
    venue: 'A-302',
    status: 'Scheduled',
  },
  {
    code: 'CE3015',
    title: 'Structural Analysis',
    program: 'Civil Engineering',
    date: '2026-03-14',
    venue: 'Main Hall',
    status: 'Timetabled',
  },
  {
    code: 'EE3021',
    title: 'Power Systems',
    program: 'Electrical & Information Engineering',
    date: '2026-03-18',
    venue: 'B-101',
    status: 'Draft',
  },
]

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Administration Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          High‑level summary of academic programs, examinations, and student performance.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {item.label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {item.value}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Upcoming examinations
            </h3>
            <span className="text-xs text-slate-500">
              Next 14 days
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Module</th>
                  <th className="py-2 pr-4">Program</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Venue</th>
                  <th className="py-2 pr-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentExams.map((exam) => (
                  <tr key={exam.code}>
                    <td className="py-2 pr-4">
                      <div className="font-medium text-slate-900">
                        {exam.code}
                      </div>
                      <div className="text-xs text-slate-500">
                        {exam.title}
                      </div>
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-600">
                      {exam.program}
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-600">
                      {exam.date}
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-600">
                      {exam.venue}
                    </td>
                    <td className="py-2 pl-4 text-right text-xs">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                        {exam.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Quick actions
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <button className="w-full rounded-lg bg-sky-600 px-3 py-2 text-left font-medium text-white shadow-sm hover:bg-sky-500">
                Schedule a new examination
              </button>
              <button className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-slate-700 hover:bg-slate-50">
                Add program / semester / module
              </button>
              <button className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-slate-700 hover:bg-slate-50">
                Enter / validate student results
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm">
            <div className="font-semibold text-slate-900">
              Data quality alerts
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-600">
              <li>12 examinations without assigned venues.</li>
              <li>37 result records pending second‑examiner validation.</li>
              <li>5 students flagged for GPA review this semester.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard

