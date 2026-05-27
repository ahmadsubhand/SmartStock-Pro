import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
  return (
    <>
      <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-indigo-600 text-white shadow-sm">
        <AppLogoIcon className="size-5 fill-current" />
      </div>
      <div className="ml-2 grid flex-1 text-left text-sm">
        <span className="mb-0 truncate leading-tight font-bold text-gray-900 dark:text-gray-100">
          SmartStock Pro
        </span>
        <span className="truncate text-[10px] font-medium text-gray-500">
          WMS Enterprise
        </span>
      </div>
    </>
  );
}