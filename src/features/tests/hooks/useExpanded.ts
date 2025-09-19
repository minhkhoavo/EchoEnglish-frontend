import { useState } from 'react';

/**
 * Custom hook để quản lý trạng thái mở rộng cho các phần như explanation, transcript, translation
 * Thay thế việc tạo nhiều state và toggle function riêng biệt
 */
export function useExpanded() {
  const [expanded, setExpanded] = useState<number[]>([]);

  const toggle = (id: number) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((num) => num !== id) : [...prev, id]
    );
  };

  const isExpanded = (id: number) => expanded.includes(id);

  return { expanded, toggle, isExpanded };
}
