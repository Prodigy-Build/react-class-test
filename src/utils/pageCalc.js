import React from 'react';

function pageCalc(pageNum, pageSize, numItems) {
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = Math.min(numItems, startIndex + pageSize);
  const hasNext = endIndex < numItems - 1;
  return { pageNum, startIndex, endIndex, hasNext };
}

export default function PageCalc() {
  const pageNum = 1;
  const pageSize = 10;
  const numItems = 100;

  const result = pageCalc(pageNum, pageSize, numItems);

  return (
    <div>
      <p>Page Number: {result.pageNum}</p>
      <p>Start Index: {result.startIndex}</p>
      <p>End Index: {result.endIndex}</p>
      <p>Has Next: {result.hasNext ? 'Yes' : 'No'}</p>
    </div>
  );
}