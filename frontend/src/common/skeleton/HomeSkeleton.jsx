const HomeSkeleton = () => {
  return (
    <div className="flex flex-col gap-3 w-full p-4">
      <div className="flex gap-4 items-center">
        <div className="skeleton w-12 h-12 rounded-full shrink-0"></div>
        <div className="flex flex-col gap-2">
          <div className="skeleton h-2 w-32 rounded-full"></div>
          <div className="skeleton h-2 w-24 rounded-full"></div>
        </div>
      </div>
      <div className="skeleton h-60 w-full"></div>
    </div>
  );
};

export default HomeSkeleton;
