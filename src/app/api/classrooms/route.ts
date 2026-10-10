import { NextRequest, NextResponse } from 'next/server';
import { Classroom } from '@/lib/types';
import { CANONICAL_CLASSROOM } from '@/lib/mockData';

// In-memory global store across serverless requests in same instance / process
// (with initial canonical classroom seeded)
let globalClassrooms: Classroom[] = [CANONICAL_CLASSROOM];

export async function GET() {
  return NextResponse.json({ classrooms: globalClassrooms });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, classroom, classId, studentId, studentName } = body;

    if (action === 'create' && classroom) {
      // Check if already exists
      const existingIdx = globalClassrooms.findIndex(c => c.id === classroom.id);
      if (existingIdx >= 0) {
        globalClassrooms[existingIdx] = classroom;
      } else {
        globalClassrooms = [classroom, ...globalClassrooms];
      }
      return NextResponse.json({ success: true, classroom });
    }

    if (action === 'enroll' && classId && studentId) {
      const targetClass = globalClassrooms.find(c => c.id === classId);
      if (!targetClass) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }

      if (targetClass.requiresApproval) {
        if (!targetClass.pendingStudentIds?.includes(studentId)) {
          targetClass.pendingStudentIds = [...(targetClass.pendingStudentIds || []), studentId];
        }
        return NextResponse.json({ success: true, message: 'Approval request sent to teacher.', classroom: targetClass });
      }

      if (!targetClass.enrolledStudentIds.includes(studentId)) {
        targetClass.enrolledStudentIds.push(studentId);
      }
      return NextResponse.json({ success: true, message: 'Enrolled successfully!', classroom: targetClass });
    }

    if (action === 'approve' && classId && studentId) {
      const targetClass = globalClassrooms.find(c => c.id === classId);
      if (targetClass) {
        targetClass.pendingStudentIds = (targetClass.pendingStudentIds || []).filter(id => id !== studentId);
        if (!targetClass.enrolledStudentIds.includes(studentId)) {
          targetClass.enrolledStudentIds.push(studentId);
        }
      }
      return NextResponse.json({ success: true, classroom: targetClass });
    }

    return NextResponse.json({ classrooms: globalClassrooms });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server database error' }, { status: 500 });
  }
}
