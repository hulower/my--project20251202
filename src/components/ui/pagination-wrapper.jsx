import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';

/**
 * PaginationWrapper - 完整的分页组件
 * 基于 shadcn/ui 官方 Pagination 组件封装
 * 
 * @param {number} currentPage - 当前页码（从 1 开始）
 * @param {number} totalPages - 总页数
 * @param {function} onPageChange - 页码变更回调
 */
function PaginationWrapper({ currentPage, totalPages, onPageChange }) {
  // 生成页码数组
  const generatePages = () => {
    const pages = [];
    const maxVisible = 5; // 最多显示 5 个页码

    if (totalPages <= maxVisible) {
      // 如果总页数小于等于 5，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总是显示第一页
      pages.push(1);

      // 计算中间显示的页码范围
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // 如果当前页靠近开始
      if (currentPage <= 3) {
        end = 4;
      }

      // 如果当前页靠近结束
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // 如果开始页码不是 2，显示省略号
      if (start > 2) {
        pages.push('ellipsis-start');
      }

      // 添加中间的页码
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 如果结束页码不是倒数第二页，显示省略号
      if (end < totalPages - 1) {
        pages.push('ellipsis-end');
      }

      // 总是显示最后一页
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePages();

  return (
    <Pagination className="my-8">
      <PaginationContent>
        {/* 上一页 */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>

        {/* 页码列表 */}
        {pages.map((page, index) => {
          if (typeof page === 'string' && page.startsWith('ellipsis')) {
            return (
              <PaginationItem key={page}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={index}>
              <PaginationLink
                isActive={currentPage === page}
                onClick={() => onPageChange(page)}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* 下一页 */}
        <PaginationItem>
          <PaginationNext
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default PaginationWrapper;

