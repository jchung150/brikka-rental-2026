export default function SpaceType({
  spaceType,
  monthlyRent,
  deposit,
}: {
  spaceType: string;
  monthlyRent: number;
  deposit: number;
}) {
  return (
    <section className="mb-[24px] border-black border-b pb-[24px] lg:mb-[32px] lg:pb-[50px]">
      <div>
        <div className="mb-[16px]">
          <h2 className="title-3xl-4xl-bold font-indivisible">
            {spaceType} Type
          </h2>
        </div>
        <div className="flex flex-col items-end gap-[8px] lg:gap-[16px]">
          <div className="font-bold text-[16px] lg:text-[24px]">
            임차료 {monthlyRent}만원부터{' '}
            <span className="text-coolgray-600">/월 12개월 기준</span>
          </div>
          <div className="font-bold text-[16px] lg:text-[24px]">
            보증금 {deposit}만원
          </div>
          <div className="body-base-medium text-coolgray-600">
            *공과금 및 관리비 별도
          </div>
        </div>
      </div>
    </section>
  );
}
