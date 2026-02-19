import type { Activity } from '../../types';

const typeIcons = {
    upload: { icon: 'cloud_upload', bg: 'bg-emerald-50 text-emerald-600' },
    login: { icon: 'login', bg: 'bg-blue-50 text-blue-600' },
    feedback: { icon: 'rate_review', bg: 'bg-orange-50 text-orange-600' },
    creation: { icon: 'add_circle', bg: 'bg-purple-50 text-purple-600' },
};

export default function ActivityItem({ activity }: { activity: Activity }) {
    const { icon, bg } = typeIcons[activity.type] || typeIcons.login;

    return (
        <div className="flex gap-3">
            <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold dark:text-white truncate">{activity.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{activity.description}</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 whitespace-nowrap pt-1">
                {activity.timestamp}
            </span>
        </div>
    );
}
