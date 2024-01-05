import React, { useState } from 'react';

function extend(dest, src1, src2) {
  const updatedDest = { ...dest, ...src1 };
  
  if (src2) {
    const updatedDestWithSrc2 = { ...updatedDest, ...src2 };
    return updatedDestWithSrc2;
  }
  
  return updatedDest;
}

export default extend;