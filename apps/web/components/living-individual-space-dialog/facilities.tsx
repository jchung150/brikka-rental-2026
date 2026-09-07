export default function Facilities({
  options,
}: { options: { label: string; values: string[] }[] }) {
  return (
    <section className="mb-[50px] border-black border-b pb-[24px] lg:mb-[130px] lg:pb-[32px]">
      <h3 className="subtitle-lg-semibold mb-[16px] font-indivisible lg:mb-[32px]">
        Facilities
      </h3>
      <div className="body-lg-medium flex flex-col items-end gap-[12px]">
        {options.map((option) => (
          <div key={option.label}>
            {option.label} | {option.values.join(', ')}
          </div>
        ))}
      </div>
    </section>
  );
}
