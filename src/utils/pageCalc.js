import React from 'react';

function pageCalc(pageNum, pageSize, numItems) {
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = Math.min(numItems, startIndex + pageSize);
  const hasNext = endIndex < numItems - 1;
  return {pageNum, startIndex, endIndex, hasNext};
}

export default function PageCalc() {
  const pageNum = 2;
  const pageSize = 10;
  const numItems = 25;

  const result = pageCalc(pageNum, pageSize, numItems);

  return <div>{JSON.stringify(result)}</div>;
}