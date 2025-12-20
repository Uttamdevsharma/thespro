const calculateGradeAndPoint = (totalMarks) => {
  if (totalMarks >= 80 && totalMarks <= 100) {
    return { grade: 'A+', point: 4.00 };
  } else if (totalMarks >= 75 && totalMarks <= 79) {
    return { grade: 'A', point: 3.75 };
  } else if (totalMarks >= 70 && totalMarks <= 74) {
    return { grade: 'A-', point: 3.50 };
  } else if (totalMarks >= 65 && totalMarks <= 69) {
    return { grade: 'B+', point: 3.25 };
  } else if (totalMarks >= 60 && totalMarks <= 64) {
    return { grade: 'B', point: 3.00 };
  } else if (totalMarks >= 55 && totalMarks <= 59) {
    return { grade: 'B-', point: 2.75 };
  } else if (totalMarks >= 50 && totalMarks <= 54) {
    return { grade: 'C+', point: 2.50 };
  } else if (totalMarks >= 45 && totalMarks <= 49) {
    return { grade: 'C', point: 2.25 };
  } else if (totalMarks >= 40 && totalMarks <= 44) {
    return { grade: 'C-', point: 2.00 };
  } else {
    return { grade: 'F', point: 0.00 };
  }
};

export default calculateGradeAndPoint;
