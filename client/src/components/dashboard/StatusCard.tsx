interface StatusCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatusCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  change,
}: StatusCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            <span className={`material-icons ${iconColor}`}>{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <p className={`ml-2 flex items-baseline text-sm font-semibold ${change.isPositive ? 'text-secondary-600' : 'text-red-600'}`}>
                    <span className="material-icons text-sm">
                      {change.isPositive ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                    <span className="sr-only">
                      {change.isPositive ? 'Increased by' : 'Decreased by'}
                    </span>
                    {change.value}
                  </p>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
