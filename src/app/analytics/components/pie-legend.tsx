// components/pie-legend.tsx

interface PieLegendProps {
  items: { name: string; count: number; fill: string }[];
  className?: string;
  totalBase?: number; // 🟢 เพิ่ม prop สำหรับกำหนดฐานตัวหาร
}

export function PieLegend({ items, className, totalBase }: PieLegendProps) {
  // 🟢 ถ้ามีการส่ง totalBase มา (เช่น 2649) ให้ใช้ totalBase ถ้าไม่มี ให้รวม count ทั้งหมด
  const total = totalBase ?? items.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={className}>
      <ul className="space-y-3">
        {items.map((item) => {
          // คำนวณเปอร์เซ็นต์จากฐานที่กำหนด
          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";

          return (
            <li key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="font-medium text-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground">
                  {item.count.toLocaleString()}
                </span>
                <span className="text-muted-foreground w-12 text-right">
                  {percentage}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}