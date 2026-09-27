import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Plus,
  UserCog,
  Phone,
  ArrowLeft,
  Trash2,
  Calendar,
  Wallet,
  TrendingUp,
  Camera as CameraIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Staff, Attendance, SalaryRecord, SalaryAdvance, EventStaff } from '@/lib/types';
import { formatCurrency, formatDate, todayISO, currentMonthISO } from '@/lib/utils';
import { STAFF_ROLES, ATTENDANCE_STATUSES } from '@/lib/constants';
import { uploadImage } from '@/lib/storage';
import { useToast } from '@/components/Toast';
import { Modal } from '@/components/Modal';
import { EmptyState, LoadingState, ConfirmDialog } from '@/components/Feedback';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar } from '@/components/Avatar';
import { ImageCropper } from '@/components/ImageCropper';

export function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { show } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Photographer');
  const [salary, setSalary] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [rawPhotoFile, setRawPhotoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('staff').select('*').order('name');
    setStaff((data || []) as Staff[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      show('Image must be under 5MB.', 'error');
      return;
    }
    setRawPhotoFile(file);
  };

  const handlePhotoCropConfirm = (cropped: File) => {
    setPhotoFile(cropped);
    setPhotoPreview(URL.createObjectURL(cropped));
    setRawPhotoFile(null);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      show('Please enter the staff name.', 'error');
      return;
    }
    setSaving(true);
    let photoUrl = '';
    if (photoFile) {
      const uploaded = await uploadImage(photoFile, 'staff');
      if (uploaded) photoUrl = uploaded;
    }
    const { error } = await supabase.from('staff').insert({
      name: name.trim(),
      phone: phone.trim(),
      role,
      monthly_salary: parseFloat(salary) || 0,
      notes: notes.trim(),
      photo_url: photoUrl,
    });
    if (error) {
      show('Something went wrong. Please try again.', 'error');
      setSaving(false);
      return;
    }
    show('Staff added successfully');
    setShowAdd(false);
    setName('');
    setPhone('');
    setRole('Photographer');
    setSalary('');
    setNotes('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setSaving(false);
    fetchStaff();
  };

  if (selectedId) {
    return (
      <StaffProfile
        staffId={selectedId}
        onBack={() => {
          setSelectedId(null);
          fetchStaff();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">Manage studio team, attendance and salary</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {loading ? (
        <LoadingState />
      ) : staff.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<UserCog className="w-8 h-8" />}
            title="No staff yet"
            message="Add your studio team members to manage attendance and salary."
            action={
              <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                <Plus className="w-4 h-4" /> Add Staff
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedId(member.id)}
              className="card card-hover p-5 text-left"
            >
              <div className="flex items-start gap-3">
                <Avatar src={member.photo_url || null} name={member.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold t-primary truncate">{member.name}</p>
                  <p className="text-sm text-brand-600 dark:text-brand-400">{member.role}</p>
                  <p className="text-sm t-muted mt-1">{formatCurrency(Number(member.monthly_salary))}/mo</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-default">
                <StatusBadge status={member.status} />
              </div>
            </button>
          ))}
        </div>
      )}

      {showAdd && (
        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Staff" size="md">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar src={photoPreview || null} name={name || '?'} size="xl" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-brand text-white flex items-center justify-center shadow-md hover:shadow-glow transition-all active:scale-90"
                >
                  <CameraIcon className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              {photoFile && (
                <button
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="text-xs t-muted hover:text-red-500"
                >
                  Remove photo
                </button>
              )}
            </div>
            <div>
              <label className="label">Name</label>
              <input className="input" placeholder="Staff name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">Role</label>
              <input className="input" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} list="staff-roles" />
              <datalist id="staff-roles">
                {STAFF_ROLES.map((r) => <option key={r} value={r} />)}
              </datalist>
            </div>
            <div>
              <label className="label">Monthly Salary</label>
              <input type="number" min="0" className="input" placeholder="0" value={salary} onChange={(e) => setSalary(e.target.value)} />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input" rows={2} placeholder="Optional notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-secondary flex-1" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={handleAdd} disabled={saving}>
                {saving ? 'Saving...' : 'Add Staff'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {rawPhotoFile && (
        <ImageCropper
          file={rawPhotoFile}
          title="Crop Staff Photo"
          onCancel={() => setRawPhotoFile(null)}
          onConfirm={handlePhotoCropConfirm}
        />
      )}
    </div>
  );
}

function StaffProfile({ staffId, onBack }: { staffId: string; onBack: () => void }) {
  const { show } = useToast();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'attendance' | 'salary'>('overview');

  const [attendanceMonth, setAttendanceMonth] = useState(currentMonthISO());
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [assignments, setAssignments] = useState<(EventStaff & { event_name: string; event_date: string })[]>([]);

  const [showSalaryPayment, setShowSalaryPayment] = useState(false);
  const [showSalaryAdvance, setShowSalaryAdvance] = useState(false);
  const [salAmount, setSalAmount] = useState('');
  const [salNote, setSalNote] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceNote, setAdvanceNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchAll = useCallback(async () => {
    const [staffData, attData, salData, advData, esData, eventsData] = await Promise.all([
      supabase.from('staff').select('*').eq('id', staffId).maybeSingle(),
      supabase.from('attendance').select('*').eq('staff_id', staffId).gte('attendance_date', `${attendanceMonth}-01`).lte('attendance_date', `${attendanceMonth}-31`),
      supabase.from('salary_records').select('*').eq('staff_id', staffId).order('payment_date', { ascending: false }),
      supabase.from('salary_advances').select('*').eq('staff_id', staffId).order('advance_date', { ascending: false }),
      supabase.from('event_staff').select('*').eq('staff_id', staffId),
      supabase.from('events').select('id,event_type,event_date,customer_name'),
    ]);
    setStaff(staffData.data as Staff | null);
    setAttendance((attData.data || []) as Attendance[]);
    setSalaryRecords((salData.data || []) as SalaryRecord[]);
    setSalaryAdvances((advData.data || []) as SalaryAdvance[]);

    const allEvents = (eventsData.data || []) as Record<string, unknown>[];
    const enriched = (esData.data || []).map((es: EventStaff) => {
      const evt = allEvents.find((e) => e.id === es.event_id);
      return { ...es, event_name: evt ? `${evt.event_type} — ${evt.customer_name}` : 'Unknown', event_date: (evt?.event_date as string) || '' };
    });
    setAssignments(enriched);
    setLoading(false);
  }, [staffId, attendanceMonth]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const markAttendance = async (date: string, status: string) => {
    const existing = attendance.find((a) => a.attendance_date === date);
    if (existing) {
      await supabase.from('attendance').update({ status }).eq('id', existing.id);
    } else {
      await supabase.from('attendance').insert({
        staff_id: staffId,
        attendance_date: date,
        status,
      });
    }
    fetchAll();
  };

  const handleSalaryPayment = async () => {
    const amount = parseFloat(salAmount) || 0;
    if (amount <= 0) {
      show('Please enter a valid amount.', 'error');
      return;
    }
    await supabase.from('salary_records').insert({
      staff_id: staffId,
      amount,
      month: currentMonthISO(),
      note: salNote,
      payment_date: todayISO(),
    });
    show('Salary payment recorded');
    setShowSalaryPayment(false);
    setSalAmount('');
    setSalNote('');
    fetchAll();
  };

  const handleSalaryAdvance = async () => {
    const amount = parseFloat(advanceAmount) || 0;
    if (amount <= 0) {
      show('Please enter a valid amount.', 'error');
      return;
    }
    await supabase.from('salary_advances').insert({
      staff_id: staffId,
      amount,
      note: advanceNote,
      advance_date: todayISO(),
    });
    show('Salary advance recorded');
    setShowSalaryAdvance(false);
    setAdvanceAmount('');
    setAdvanceNote('');
    fetchAll();
  };

  const handleDelete = async () => {
    await supabase.from('staff').delete().eq('id', staffId);
    show('Staff member removed');
    onBack();
  };

  if (loading) return <LoadingState />;
  if (!staff) return <p className="t-muted">Staff member not found.</p>;

  const [year, month] = attendanceMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = todayISO();

  const summary = ATTENDANCE_STATUSES.map((s) => ({
    ...s,
    count: attendance.filter((a) => a.status === s.key).length,
  }));

  const totalPaid = salaryRecords.reduce((s, r) => s + Number(r.amount), 0);
  const totalAdvance = salaryAdvances.reduce((s, a) => s + Number(a.amount), 0);
  const salary = Number(staff.monthly_salary);
  const remaining = salary + totalAdvance - totalPaid;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm t-muted hover:t-secondary">
        <ArrowLeft className="w-4 h-4" /> Back to Staff
      </button>

      <div className="card p-6">
        <div className="flex items-start gap-4">
          <Avatar src={staff.photo_url || null} name={staff.name} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold t-primary">{staff.name}</h1>
            <p className="text-brand-600 dark:text-brand-400 font-medium">{staff.role}</p>
            {staff.phone && (
              <a href={`tel:${staff.phone}`} className="flex items-center gap-2 t-muted hover:text-brand-600 dark:text-brand-400 mt-1 text-sm">
                <Phone className="w-4 h-4" /> {staff.phone}
              </a>
            )}
          </div>
          <StatusBadge status={staff.status} />
        </div>
      </div>

      <div className="flex gap-1 bg-surface rounded-lg border border-default p-1">
        {(['overview', 'attendance', 'salary'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-gradient-brand text-white shadow-sm' : 't-muted hover:bg-surface-subtle'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h2 className="section-title mb-4">Profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="t-muted">Role</span><span className="t-secondary font-medium">{staff.role}</span></div>
              <div className="flex justify-between"><span className="t-muted">Monthly Salary</span><span className="t-secondary font-medium">{formatCurrency(salary)}</span></div>
              <div className="flex justify-between"><span className="t-muted">Phone</span><span className="t-secondary font-medium">{staff.phone || '—'}</span></div>
            </div>
            {staff.notes && (
              <div className="mt-4 pt-4 border-t border-default">
                <p className="text-sm t-muted mb-1">Notes</p>
                <p className="text-sm t-secondary">{staff.notes}</p>
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="section-title flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-brand-600 dark:text-brand-400" /> Event Assignments
            </h2>
            {assignments.length === 0 ? (
              <p className="text-sm t-muted py-4 text-center">No event assignments.</p>
            ) : (
              <div className="space-y-3">
                {assignments.map((as) => (
                  <div key={as.id} className="flex items-center justify-between py-2 border-b border-default last:border-0">
                    <div>
                      <p className="text-sm font-medium t-secondary">{as.event_name}</p>
                      <p className="text-xs t-muted">{formatDate(as.event_date)} · {as.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="month"
              className="input sm:w-48"
              value={attendanceMonth}
              onChange={(e) => setAttendanceMonth(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summary.map((s) => (
              <div key={s.key} className="card p-4 text-center">
                <p className="text-sm t-muted">{s.label}</p>
                <p className="text-2xl font-bold t-primary mt-1">{s.count}</p>
              </div>
            ))}
          </div>

          <div className="card p-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th className="text-left py-2 px-2 t-muted font-medium">Date</th>
                  {ATTENDANCE_STATUSES.map((s) => (
                    <th key={s.key} className="py-2 px-2 t-muted font-medium text-center">{s.key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1;
                  const dateStr = `${attendanceMonth}-${String(d).padStart(2, '0')}`;
                  const att = attendance.find((a) => a.attendance_date === dateStr);
                  const isFuture = dateStr > today;
                  return (
                    <tr key={d} className="border-b border-default">
                      <td className="py-2 px-2 t-secondary">{d} — {new Date(year, month - 1, d).toLocaleDateString('en-IN', { weekday: 'short' })}</td>
                      {ATTENDANCE_STATUSES.map((s) => (
                        <td key={s.key} className="py-1.5 px-2 text-center">
                          <button
                            disabled={isFuture}
                            onClick={() => markAttendance(dateStr, s.key)}
                            className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${
                              att?.status === s.key
                                ? s.color === 'success' ? 'bg-green-500 text-white'
                                  : s.color === 'error' ? 'bg-red-500 text-white'
                                  : s.color === 'warning' ? 'bg-amber-500 text-white'
                                  : 'bg-brand-500/100 text-white'
                                : 'bg-surface-subtle t-faint hover:bg-surface-subtle'
                            } ${isFuture ? 'opacity-30 cursor-not-allowed' : ''}`}
                          >
                            {s.key}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'salary' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="section-title mb-4">Salary Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="p-3 bg-surface-subtle rounded-lg">
                <p className="t-muted">Salary</p>
                <p className="text-lg font-bold t-primary mt-1">{formatCurrency(salary)}</p>
              </div>
              <div className="p-3 bg-surface-subtle rounded-lg">
                <p className="t-muted">Advances</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(totalAdvance)}</p>
              </div>
              <div className="p-3 bg-surface-subtle rounded-lg">
                <p className="t-muted">Paid</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="p-3 bg-surface-subtle rounded-lg">
                <p className="t-muted">Remaining</p>
                <p className="text-lg font-bold t-primary mt-1">{formatCurrency(remaining)}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary flex-1" onClick={() => setShowSalaryPayment(true)}>
                <Wallet className="w-4 h-4" /> Salary Payment
              </button>
              <button className="btn btn-secondary flex-1" onClick={() => setShowSalaryAdvance(true)}>
                <TrendingUp className="w-4 h-4" /> Salary Advance
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h2 className="section-title mb-4">Payment History</h2>
              {salaryRecords.length === 0 ? (
                <p className="text-sm t-muted py-4 text-center">No payments recorded.</p>
              ) : (
                <div className="space-y-2">
                  {salaryRecords.map((r) => (
                    <div key={r.id} className="flex justify-between py-2 border-b border-default last:border-0 text-sm">
                      <div>
                        <p className="t-secondary font-medium">{formatCurrency(Number(r.amount))}</p>
                        <p className="text-xs t-muted">{formatDate(r.payment_date)} · {r.month}</p>
                      </div>
                      {r.note && <span className="text-xs t-muted self-center">{r.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <h2 className="section-title mb-4">Advance History</h2>
              {salaryAdvances.length === 0 ? (
                <p className="text-sm t-muted py-4 text-center">No advances recorded.</p>
              ) : (
                <div className="space-y-2">
                  {salaryAdvances.map((a) => (
                    <div key={a.id} className="flex justify-between py-2 border-b border-default last:border-0 text-sm">
                      <div>
                        <p className="t-secondary font-medium">{formatCurrency(Number(a.amount))}</p>
                        <p className="text-xs t-muted">{formatDate(a.advance_date)}</p>
                      </div>
                      {a.note && <span className="text-xs t-muted self-center">{a.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="w-4 h-4" /> Remove Staff
        </button>
      </div>

      {showSalaryPayment && (
        <Modal open={showSalaryPayment} onClose={() => setShowSalaryPayment(false)} title="Record Salary Payment" size="sm">
          <div className="space-y-4">
            <div>
              <label className="label">Amount</label>
              <input type="number" min="0" className="input" placeholder="0" value={salAmount} onChange={(e) => setSalAmount(e.target.value)} />
            </div>
            <div>
              <label className="label">Note</label>
              <input className="input" placeholder="Optional note" value={salNote} onChange={(e) => setSalNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-secondary flex-1" onClick={() => setShowSalaryPayment(false)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={handleSalaryPayment}>Save</button>
            </div>
          </div>
        </Modal>
      )}

      {showSalaryAdvance && (
        <Modal open={showSalaryAdvance} onClose={() => setShowSalaryAdvance(false)} title="Record Salary Advance" size="sm">
          <div className="space-y-4">
            <div>
              <label className="label">Amount</label>
              <input type="number" min="0" className="input" placeholder="0" value={advanceAmount} onChange={(e) => setAdvanceAmount(e.target.value)} />
            </div>
            <div>
              <label className="label">Note</label>
              <input className="input" placeholder="Optional note" value={advanceNote} onChange={(e) => setAdvanceNote(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-secondary flex-1" onClick={() => setShowSalaryAdvance(false)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={handleSalaryAdvance}>Save</button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Remove Staff"
        message={`Are you sure you want to remove ${staff.name}? This cannot be undone.`}
        confirmLabel="Remove"
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
