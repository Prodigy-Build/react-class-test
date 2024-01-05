import React from 'react';

function pageCalc(pageNum, pageSize, numItems) {
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = Math.min(numItems, startIndex + pageSize);
  const hasNext = endIndex < numItems - 1;
  return {pageNum, startIndex, endIndex, hasNext};
}

export default function PageCalcComponent() {
  const pageNum = // provide your logic to get pageNum
  const pageSize = // provide your logic to get pageSize
  const numItems = // provide your logic to get numItems

  const pageInfo = pageCalc(pageNum, pageSize, numItems);

  return (
    <div>
      <p>Page Number: {pageInfo.pageNum}</p>
      <p>Start Index: {pageInfo.startIndex}</p>
      <p>End Index: {pageInfo.endIndex}</p>
      <p>Has Next: {pageInfo.hasNext ? 'Yes' : 'No'}</p>
    </div>
  );
}