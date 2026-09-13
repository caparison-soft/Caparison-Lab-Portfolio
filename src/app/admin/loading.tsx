/** Skeleton for admin screens: heading, then rows. */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-3 max-w-[1100px]" aria-busy="true">
      <div className="h-[14px] w-[80px] bg-paper rounded-sm" />
      <div className="h-[40px] w-[260px] bg-paper rounded-sm" />
      <div className="mt-2 border-t border-divider-light">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="border-b border-divider-light py-2 flex items-center gap-2">
            <div className="h-[20px] w-[240px] bg-paper rounded-sm" />
            <div className="h-[16px] w-[120px] bg-paper rounded-sm" />
            <div className="ml-auto h-[24px] w-[80px] bg-paper rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}
