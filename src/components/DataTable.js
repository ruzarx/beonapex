import React, { useState, useEffect } from "react";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.1, duration: 0.5 }
  }),
};

const DataTable = ({ data, selectedColumns }) => {
  const [sortedData, setSortedData] = useState(data);
  const [sortColumn, setSortColumn] = useState("position");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  const handleSort = (column) => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    setSortColumn(column);

    const sorted = [...sortedData].sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return newOrder === "asc" ? valueA - valueB : valueB - valueA;
      } else {
        return newOrder === "asc"
          ? valueA.toString().localeCompare(valueB.toString())
          : valueB.toString().localeCompare(valueA.toString());
      }
    });

    setSortedData(sorted);
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: "auto" }}>
      <Table>
        <TableHead>
          <TableRow>
            {selectedColumns.map((col, index) => (
              <TableCell key={index}>
                <TableSortLabel
                  active={sortColumn.toLowerCase() === col.toLowerCase()}
                  direction={sortOrder}
                  onClick={() => handleSort(col.toLowerCase())}
                >
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <AnimatePresence>
            {sortedData.map((row, index) => (
              <motion.tr key={index} initial="hidden" animate="visible" exit="hidden" variants={rowVariants} custom={index} style={{ display: "table-row" }}>
                {selectedColumns.map((col) => (
                  <TableCell key={col}>{row[col]}</TableCell>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
