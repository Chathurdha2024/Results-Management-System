import React from 'react';
import { Card } from '../components/ui.jsx';

const ProfileModule = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center text-xl font-semibold text-primary-700">
          SB
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Student Name</p>
          <p className="text-xs text-slate-500">
            Registration No: 2023CS001
          </p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Degree Program
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-900">
          BSc (Hons) in Computer Science
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Academic Year: 2025/2026
        </p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Contact
        </p>
        <p className="mt-2 text-sm text-slate-900">student@example.edu</p>
        <p className="mt-1 text-sm text-slate-900">+94 71 234 5678</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="Account Settings">
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Change password</p>
              <p className="text-slate-500">
                Update your login password regularly to keep your account
                secure.
              </p>
            </div>
            <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black">
              Change
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">
                Update contact info
              </p>
              <p className="text-slate-500">
                Keep your email and phone number up to date.
              </p>
            </div>
            <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
              Edit
            </button>
          </div>
        </div>
      </Card>

      <Card title="Support / Help">
        <div className="space-y-3 text-xs">
          <p className="text-slate-500">
            If you notice any incorrect information or have issues accessing
            modules, please contact the examinations branch or IT support.
          </p>
          <ul className="space-y-1 text-slate-700">
            <li>Email: examoffice@example.edu</li>
            <li>IT Helpdesk: +94 11 234 5678</li>
          </ul>
        </div>
      </Card>
    </div>
  </div>
);

export default ProfileModule;

