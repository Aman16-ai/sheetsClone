import React, { useState, useEffect, useRef } from "react";
import {
  Edit,
  ChevronDown,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash,
  Save,
  Share2,
} from "lucide-react";
import logo from "../assets/sheets.png";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import DriveFileMoveOutlinedIcon from "@mui/icons-material/DriveFileMoveOutlined";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import InsertCommentOutlinedIcon from "@mui/icons-material/InsertCommentOutlined";
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// Main application component
const Sheets = () => {
  // State for spreadsheet data
  const [data, setData] = useState(() => {
    const initialData = {};
    for (let row = 0; row < 100; row++) {
      for (let col = 0; col < 26; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        initialData[cellId] = {
          value: "",
          formula: "",
          formattedValue: "",
          format: {
            bold: false,
            italic: false,
            fontSize: 12,
            color: "#000000",
            backgroundColor: "#ffffff",
            align: "left",
          },
        };
      }
    }
    return initialData;
  });

  const [activeCell, setActiveCell] = useState(null);
  const [formulaBarValue, setFormulaBarValue] = useState("");
  const [selectedRange, setSelectedRange] = useState(null);
  const [cellDependencies, setCellDependencies] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartCell, setDragStartCell] = useState(null);

  const formulaBarRef = useRef(null);

  // Handle cell selection
  const handleCellClick = (cellId) => {
    setActiveCell(cellId);
    setFormulaBarValue(data[cellId]?.formula || data[cellId]?.value || "");
    if (formulaBarRef.current) {
      formulaBarRef.current.focus();
    }
  };

  // Update cell value and recalculate dependencies
  const updateCell = (cellId, newValue, isFormula = false) => {
    const updatedData = { ...data };

    if (isFormula) {
      updatedData[cellId] = {
        ...updatedData[cellId],
        formula: newValue,
        value: evaluateFormula(newValue, updatedData),
        formattedValue: formatCellValue(evaluateFormula(newValue, updatedData)),
      };

      // Update dependencies
      updateCellDependencies(cellId, newValue);
    } else {
      updatedData[cellId] = {
        ...updatedData[cellId],
        value: newValue,
        formula: "",
        formattedValue: formatCellValue(newValue),
      };
    }

    setData(updatedData);

    // Recalculate all cells that depend on this cell
    recalculateDependentCells(cellId, updatedData);
  };

  // Update cell dependencies based on formula
  const updateCellDependencies = (cellId, formula) => {
    // Extract cell references from formula
    const cellRefs = extractCellReferences(formula);
    const newDependencies = { ...cellDependencies };

    // Remove current cell from all previous dependencies
    Object.keys(newDependencies).forEach((depCell) => {
      if (newDependencies[depCell]?.includes(cellId)) {
        newDependencies[depCell] = newDependencies[depCell].filter(
          (cell) => cell !== cellId
        );
      }
    });

    // Add dependencies for each referenced cell
    cellRefs.forEach((ref) => {
      if (!newDependencies[ref]) {
        newDependencies[ref] = [];
      }
      if (!newDependencies[ref].includes(cellId)) {
        newDependencies[ref].push(cellId);
      }
    });

    setCellDependencies(newDependencies);
  };

  // Extract cell references from a formula string
  const extractCellReferences = (formula) => {
    if (!formula) return [];
    // Match patterns like A1, B12, AA34, etc.
    const cellPattern = /[A-Z]+[0-9]+/g;
    return formula.match(cellPattern) || [];
  };

  // Recalculate all cells that depend on the changed cell
  const recalculateDependentCells = (cellId, currentData) => {
    const dependencies = cellDependencies[cellId] || [];
    const updatedData = { ...currentData };

    dependencies.forEach((depCellId) => {
      const formula = updatedData[depCellId]?.formula || "";
      if (formula) {
        updatedData[depCellId] = {
          ...updatedData[depCellId],
          value: evaluateFormula(formula, updatedData),
          formattedValue: formatCellValue(
            evaluateFormula(formula, updatedData)
          ),
        };

        // Recursively update cells that depend on this cell
        recalculateDependentCells(depCellId, updatedData);
      }
    });

    setData(updatedData);
  };

  // Evaluate formula and return result
  const evaluateFormula = (formula, currentData) => {
    if (!formula) return "";
    if (formula[0] !== "=") return formula;

    try {
      let processedFormula = formula.substring(1);

      // Handle SUM function
      processedFormula = processSum(processedFormula, currentData);

      // Handle AVERAGE function
      processedFormula = processAverage(processedFormula, currentData);

      // Handle MAX function
      processedFormula = processMax(processedFormula, currentData);

      // Handle MIN function
      processedFormula = processMin(processedFormula, currentData);

      // Handle COUNT function
      processedFormula = processCount(processedFormula, currentData);

      // Handle TRIM function
      processedFormula = processTrim(processedFormula, currentData);

      // Handle UPPER function
      processedFormula = processUpper(processedFormula, currentData);

      // Handle LOWER function
      processedFormula = processLower(processedFormula, currentData);

      // Replace cell references with their values
      const cellPattern = /[A-Z]+[0-9]+/g;
      processedFormula = processedFormula.replace(cellPattern, (match) => {
        return currentData[match]?.value || 0;
      });

      // Use Function constructor for evaluation (safer than eval)
      return new Function(`return ${processedFormula}`)();
    } catch (error) {
      return "#ERROR!";
    }
  };

  // Format cell value for display
  const formatCellValue = (value) => {
    if (typeof value === "number") {
      return value.toString();
    }
    return value;
  };

  // Process SUM function
  const processSum = (formula, currentData) => {
    return formula.replace(
      /SUM\(([A-Z][0-9]+:[A-Z][0-9]+)\)/g,
      (match, range) => {
        const cellValues = getCellValuesFromRange(range, currentData);
        const numericValues = cellValues.filter((v) => !isNaN(Number(v)));
        return numericValues.reduce((sum, val) => sum + Number(val), 0);
      }
    );
  };

  // Process AVERAGE function
  const processAverage = (formula, currentData) => {
    return formula.replace(
      /AVERAGE\(([A-Z][0-9]+:[A-Z][0-9]+)\)/g,
      (match, range) => {
        const cellValues = getCellValuesFromRange(range, currentData);
        const numericValues = cellValues.filter((v) => !isNaN(Number(v)));
        if (numericValues.length === 0) return 0;
        return (
          numericValues.reduce((sum, val) => sum + Number(val), 0) /
          numericValues.length
        );
      }
    );
  };

  // Process MAX function
  const processMax = (formula, currentData) => {
    return formula.replace(
      /MAX\(([A-Z][0-9]+:[A-Z][0-9]+)\)/g,
      (match, range) => {
        const cellValues = getCellValuesFromRange(range, currentData);
        const numericValues = cellValues
          .filter((v) => !isNaN(Number(v)))
          .map(Number);
        if (numericValues.length === 0) return 0;
        return Math.max(...numericValues);
      }
    );
  };

  // Process MIN function
  const processMin = (formula, currentData) => {
    return formula.replace(
      /MIN\(([A-Z][0-9]+:[A-Z][0-9]+)\)/g,
      (match, range) => {
        const cellValues = getCellValuesFromRange(range, currentData);
        const numericValues = cellValues
          .filter((v) => !isNaN(Number(v)))
          .map(Number);
        if (numericValues.length === 0) return 0;
        return Math.min(...numericValues);
      }
    );
  };

  // Process COUNT function
  const processCount = (formula, currentData) => {
    return formula.replace(
      /COUNT\(([A-Z][0-9]+:[A-Z][0-9]+)\)/g,
      (match, range) => {
        const cellValues = getCellValuesFromRange(range, currentData);
        return cellValues.filter((v) => !isNaN(Number(v)) && v !== "").length;
      }
    );
  };

  // Process TRIM function
  const processTrim = (formula, currentData) => {
    return formula.replace(/TRIM\(([A-Z][0-9]+)\)/g, (match, cellId) => {
      const cellValue = currentData[cellId]?.value || "";
      return `"${cellValue.trim()}"`;
    });
  };

  // Process UPPER function
  const processUpper = (formula, currentData) => {
    return formula.replace(/UPPER\(([A-Z][0-9]+)\)/g, (match, cellId) => {
      const cellValue = currentData[cellId]?.value || "";
      return `"${cellValue.toUpperCase()}"`;
    });
  };

  // Process LOWER function
  const processLower = (formula, currentData) => {
    return formula.replace(/LOWER\(([A-Z][0-9]+)\)/g, (match, cellId) => {
      const cellValue = currentData[cellId]?.value || "";
      return `"${cellValue.toLowerCase()}"`;
    });
  };

  // Get cell values from a range (e.g., A1:B3)
  const getCellValuesFromRange = (range, currentData) => {
    const [start, end] = range.split(":");
    const startCol = start.charCodeAt(0) - 65; // Convert A to 0, B to 1, etc.
    const startRow = parseInt(start.substring(1)) - 1;
    const endCol = end.charCodeAt(0) - 65;
    const endRow = parseInt(end.substring(1)) - 1;

    const values = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        values.push(currentData[cellId]?.value || "");
      }
    }

    return values;
  };

  // Function to remove duplicates from a range
  const removeDuplicates = (range) => {
    const [start, end] = range.split(":");
    const startCol = start.charCodeAt(0) - 65;
    const startRow = parseInt(start.substring(1)) - 1;
    const endCol = end.charCodeAt(0) - 65;
    const endRow = parseInt(end.substring(1)) - 1;

    // Get all rows in the range
    const rows = [];
    for (let row = startRow; row <= endRow; row++) {
      const rowData = [];
      for (let col = startCol; col <= endCol; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        rowData.push(data[cellId]?.value || "");
      }
      rows.push({ row, values: rowData.join("|") }); // Join values to create a unique string per row
    }

    // Find duplicates
    const uniqueRows = new Set();
    const duplicateRows = [];

    rows.forEach(({ row, values }) => {
      if (uniqueRows.has(values)) {
        duplicateRows.push(row);
      } else {
        uniqueRows.add(values);
      }
    });

    // Clear duplicate rows
    const updatedData = { ...data };
    duplicateRows.forEach((row) => {
      for (let col = startCol; col <= endCol; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        updatedData[cellId] = {
          ...updatedData[cellId],
          value: "",
          formula: "",
          formattedValue: "",
        };
      }
    });

    setData(updatedData);
  };

  // Function to implement find and replace
  const findAndReplace = (range, findText, replaceText) => {
    const [start, end] = range.split(":");
    const startCol = start.charCodeAt(0) - 65;
    const startRow = parseInt(start.substring(1)) - 1;
    const endCol = end.charCodeAt(0) - 65;
    const endRow = parseInt(end.substring(1)) - 1;

    const updatedData = { ...data };

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        const cellValue = updatedData[cellId]?.value || "";

        if (typeof cellValue === "string" && cellValue.includes(findText)) {
          const newValue = cellValue.replace(
            new RegExp(findText, "g"),
            replaceText
          );
          updatedData[cellId] = {
            ...updatedData[cellId],
            value: newValue,
            formattedValue: formatCellValue(newValue),
          };
        }
      }
    }

    setData(updatedData);
  };

  // Function to apply formatting to cells
  const applyFormatting = (cellId, formatType, value) => {
    const updatedData = { ...data };

    updatedData[cellId] = {
      ...updatedData[cellId],
      format: {
        ...updatedData[cellId].format,
        [formatType]: value,
      },
    };

    setData(updatedData);
  };

  // Function to add a row below the active cell
  const addRow = () => {
    if (!activeCell) return;

    const activeRow = parseInt(activeCell.substring(1));
    const updatedData = { ...data };

    // Shift all rows below down by one
    for (let row = 99; row > activeRow; row--) {
      for (let col = 0; col < 26; col++) {
        const targetCellId = `${String.fromCharCode(65 + col)}${row}`;
        const sourceCellId = `${String.fromCharCode(65 + col)}${row - 1}`;
        updatedData[targetCellId] = { ...updatedData[sourceCellId] };
      }
    }

    // Clear the new row
    for (let col = 0; col < 26; col++) {
      const cellId = `${String.fromCharCode(65 + col)}${activeRow + 1}`;
      updatedData[cellId] = {
        value: "",
        formula: "",
        formattedValue: "",
        format: {
          bold: false,
          italic: false,
          fontSize: 12,
          color: "#000000",
          backgroundColor: "#ffffff",
          align: "left",
        },
      };
    }

    setData(updatedData);
  };

  // Function to delete a row
  const deleteRow = () => {
    if (!activeCell) return;

    const activeRow = parseInt(activeCell.substring(1));
    const updatedData = { ...data };

    // Shift all rows below up by one
    for (let row = activeRow; row < 99; row++) {
      for (let col = 0; col < 26; col++) {
        const targetCellId = `${String.fromCharCode(65 + col)}${row}`;
        const sourceCellId = `${String.fromCharCode(65 + col)}${row + 1}`;
        updatedData[targetCellId] = { ...updatedData[sourceCellId] };
      }
    }

    // Clear the last row
    for (let col = 0; col < 26; col++) {
      const cellId = `${String.fromCharCode(65 + col)}99`;
      updatedData[cellId] = {
        value: "",
        formula: "",
        formattedValue: "",
        format: {
          bold: false,
          italic: false,
          fontSize: 12,
          color: "#000000",
          backgroundColor: "#ffffff",
          align: "left",
        },
      };
    }

    setData(updatedData);
  };

  // Handle drag start
  const handleDragStart = (cellId) => {
    setIsDragging(true);
    setDragStartCell(cellId);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);

    if (dragStartCell && selectedRange) {
      // Copy data from drag start cell to selected range
      const updatedData = { ...data };
      const [startCell, endCell] = selectedRange;

      const startCol = startCell.charCodeAt(0) - 65;
      const startRow = parseInt(startCell.substring(1)) - 1;
      const endCol = endCell.charCodeAt(0) - 65;
      const endRow = parseInt(endCell.substring(1)) - 1;

      const sourceValue = data[dragStartCell]?.value || "";
      const sourceFormula = data[dragStartCell]?.formula || "";

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const cellId = `${String.fromCharCode(65 + col)}${row + 1}`;
          updatedData[cellId] = {
            ...updatedData[cellId],
            value: sourceValue,
            formula: sourceFormula,
            formattedValue: formatCellValue(sourceValue),
          };
        }
      }

      setData(updatedData);
    }

    setDragStartCell(null);
    setSelectedRange(null);
  };

  // Render spreadsheet toolbar
  const renderToolbar = () => {
    return (
      <div className="flex items-center px-2 py-1 border-b border-gray-300 text-sm">
        <button className="p-1 mx-1 text-gray-600" title="Save">
          <Save size={16} />
        </button>
        <button className="p-1 mx-1 text-gray-600" title="Share">
          <Share2 size={16} />
        </button>
        <button className="p-1 mx-1 text-gray-600" title="Refresh">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
        <button className="p-1 mx-1 text-gray-600" title="Format">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" ry="2" />
            <path d="M9 3h6v3H9zM9 18h6v3H9zM3 9v6h3V9zM18 9v6h3V9z" />
          </svg>
        </button>
        <select
          className="mx-2 border border-gray-300 rounded px-1"
          title="Zoom"
        >
          <option>100%</option>
        </select>
        <button className="p-1 mx-1 text-gray-600" title="Format as Currency">
          $
        </button>
        <button className="p-1 mx-1 text-gray-600" title="Format as Percentage">
          %
        </button>
        <button className="p-1 mx-1 text-gray-600" title="Format Decimal (.0)">
          .0
        </button>
        <button className="p-1 mx-1 text-gray-600" title="Format Decimal (.00)">
          .00
        </button>
        <span className="mx-1 text-gray-500">123</span>
        <select
          className="mx-2 border border-gray-300 rounded px-1"
          title="Function Selection"
        >
          <option>Default</option>
          <option value="SUM">SUM</option>
          <option value="AVERAGE">AVERAGE</option>
          <option value="MAX">MAX</option>
          <option value="MIN">MIN</option>
          <option value="COUNT">COUNT</option>
          <option value="TRIM">TRIM</option>
          <option value="UPPER">UPPER</option>
          <option value="LOWER">LOWER</option>
        </select>
        <button
          className="p-1 mx-1 text-gray-600"
          onClick={() => deleteRow()}
          title="Delete Row"
        >
          −
        </button>
        <button className="p-1 mx-1 text-gray-600" title="Font Size">
          10
        </button>
        <button
          className="p-1 mx-1 text-gray-600"
          onClick={() => addRow()}
          title="Add Row"
        >
          +
        </button>
        <button
          className={`p-1 mx-1 text-gray-600 font-bold ${
            activeCell && data[activeCell]?.format?.bold ? "bg-gray-300" : ""
          }`}
          onClick={() =>
            activeCell &&
            applyFormatting(activeCell, "bold", !data[activeCell]?.format?.bold)
          }
          title="Bold"
        >
          B
        </button>
        <button
          className={`p-1 mx-1 text-gray-600 italic ${
            activeCell && data[activeCell]?.format?.italic ? "bg-gray-300" : ""
          }`}
          onClick={() =>
            activeCell &&
            applyFormatting(
              activeCell,
              "italic",
              !data[activeCell]?.format?.italic
            )
          }
          title="Italic"
        >
          I
        </button>
        <button
          className="p-1 mx-1 text-gray-600 underline"
          title="Strikethrough"
        >
          S
        </button>
        <div className="mx-1 border-l border-gray-300 h-6"></div>
        <div className="flex space-x-1 ml-1">
          <button
            className={`p-1 mx-1 text-gray-600 ${
              activeCell && data[activeCell]?.format?.align === "left"
                ? "bg-gray-300"
                : ""
            }`}
            onClick={() =>
              activeCell && applyFormatting(activeCell, "align", "left")
            }
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            className={`p-1 mx-1 text-gray-600 ${
              activeCell && data[activeCell]?.format?.align === "center"
                ? "bg-gray-300"
                : ""
            }`}
            onClick={() =>
              activeCell && applyFormatting(activeCell, "align", "center")
            }
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            className={`p-1 mx-1 text-gray-600 ${
              activeCell && data[activeCell]?.format?.align === "right"
                ? "bg-gray-300"
                : ""
            }`}
            onClick={() =>
              activeCell && applyFormatting(activeCell, "align", "right")
            }
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
        </div>
        <button className="p-1 mx-1 text-gray-600" title="More Options">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 10h18" />
            <path d="M3 14h18" />
            <path d="M3 6h18" />
            <path d="M3 18h18" />
          </svg>
        </button>
        <div className="ml-auto flex items-center">
          <button className="text-sm px-2 py-1 text-gray-600 border border-gray-300 rounded mr-2">
            Remove Duplicates
          </button>
          <button className="text-sm px-2 py-1 text-gray-600 border border-gray-300 rounded">
            Find & Replace
          </button>
        </div>
      </div>
    );
  };
  // Render formula bar
  const renderFormulaBar = () => {
    return (
      <div className="flex items-center px-2 py-1 border-b border-gray-300">
        <div className="flex items-center border rounded border-gray-300 px-2 mr-2">
          <span className="text-gray-600 text-sm w-[80px]">{activeCell || ""}</span>
          <span className="ml-1">▼</span>
        </div>
        <div className="px-2 mr-2">
          <span className="text-gray-600">fx</span>
        </div>
        <input
          ref={formulaBarRef}
          type="text"
          value={formulaBarValue}
          onChange={(e) => {

            setFormulaBarValue(e.target.value)
            const temp = {...data}
            temp[activeCell].value = e.target.value
            setData(temp)
            
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && activeCell) {
              const isFormula = formulaBarValue.startsWith("=");
              updateCell(activeCell, formulaBarValue, isFormula);
            }
          }}
          className="flex-1 border border-gray-300 rounded p-1 text-sm"
          placeholder="Enter a value or formula (start with =)"
        />
      </div>
    );
  };

  // Render spreadsheet grid
  const renderGrid = () => {
    const rows = 20; // Show 20 rows for demonstration
    const cols = 10; // Show 10 columns for demonstration

    // Generate column headers (A, B, C, etc.)
    const columns = Array.from({ length: cols }, (_, i) =>
      String.fromCharCode(65 + i)
    );

    // Generate row numbers (1, 2, 3, etc.)
    const rowNumbers = Array.from({ length: rows }, (_, i) => i + 1);

    const isColActived = (col) => {
      return activeCell && activeCell[0] === col;
    };
    return (
      <div className="flex-1 overflow-auto">
        <table className="border-collapse w-full">
          <thead>
            <tr>
              <th className="w-10 bg-gray-100 border border-gray-300"></th>
              {columns.map((col) => (
                <th
                  key={col}
                  className={`w-24 ${
                    isColActived(col) ? "bg-[#D3E3FD]" : "bg-gray-100"
                  } border border-gray-300 text-center py-1 text-sm font-normal text-gray-700`}
                >
                  {isColActived(col)}
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowNumbers.map((rowNum) => (
              <tr key={rowNum}>
                <td className="bg-gray-100 border border-gray-300 text-center py-1 text-sm text-gray-700">
                  {rowNum}
                </td>
                {columns.map((col) => {
                  const cellId = `${col}${rowNum}`;
                  const cellData = data[cellId] || {};
                  const isActive = activeCell === cellId;

                  return (
                    <td
                      key={cellId}
                      className={`border px-2 py-1 text-sm relative
                        ${
                          isActive
                            ? "border-blue-500 border-2 z-10"
                            : "border-gray-300"
                        }`}
                      onClick={() => handleCellClick(cellId)}
                      draggable
                      onDragStart={() => handleDragStart(cellId)}
                      onDragEnd={handleDragEnd}
                      style={{
                        fontWeight: cellData.format?.bold ? "bold" : "normal",
                        fontStyle: cellData.format?.italic
                          ? "italic"
                          : "normal",
                        textAlign: cellData.format?.align || "left",
                        // Add subtle outline to avoid layout shift with border-2
                        outline: isActive ? "none" : "inherit",
                      }}
                    >
                      {cellData.formattedValue || cellData.value || ""}
                      {isActive && (
                        <>
                          <div className="absolute w-3 h-3 bg-blue-600 right-0 bottom-0 cursor-crosshair" />
                          {/* Add focus outline that extends to row and column headers */}
                          <div className="absolute h-full w-1 bg-blue-200 left-0 top-0 -ml-1"></div>
                          <div className="absolute h-1 w-full bg-blue-200 left-0 top-0 -mt-1"></div>
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMenuBar = () => {
    return (
      <div className="menu-bar h-8 bg-white border-b border-gray-300 flex items-center px-2 text-gray-800">
        <div className="flex items-center mr-4">
          <FileText size={16} className="mr-1 text-green-600" />
          <span className="font-medium text-sm text-gray-700">Sheets</span>
        </div>

        <div className="flex space-x-4 text-xs">
          <div className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
            <span>File</span>
            <ChevronDown size={12} className="ml-1" />
          </div>
          <div className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
            <span>Edit</span>
            <ChevronDown size={12} className="ml-1" />
          </div>
          <div className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
            <span>View</span>
            <ChevronDown size={12} className="ml-1" />
          </div>
          <div className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
            <span>Insert</span>
            <ChevronDown size={12} className="ml-1" />
          </div>
          <div className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
            <span>Format</span>
            <ChevronDown size={12} className="ml-1" />
          </div>
          <div className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
            <span>Data</span>
            <ChevronDown size={12} className="ml-1" />
          </div>
          <div className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
            <span>Tools</span>
            <ChevronDown size={12} className="ml-1" />
          </div>
          <div className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
            <span>Extensions</span>
            <ChevronDown size={12} className="ml-1" />
          </div>
          <div className="flex items-center cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
            <span>Help</span>
            <ChevronDown size={12} className="ml-1" />
          </div>
        </div>

        <div className="ml-auto flex items-center">
          <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-200 cursor-pointer">
            <span className="text-xs font-medium">Share</span>
          </div>
        </div>
      </div>
    );
  };

  // Render testing panel

  const [activeTestPlane, setActiveTestPlane] = useState(true);
  const renderTestingPanel = () => {
    return (
      <div className="testing-panel p-2 bg-gray-50 border-t mt-4">
        <button className="bg-blue-600 w-20 h-10 rounded-md cursor-pointer text-white" onClick={e => setActiveTestPlane(false)}>Close</button>
        <h3 className="text-sm font-medium mb-2">Function Testing</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs mb-1">Test Mathematical Functions:</p>
            <div className="text-xs mb-2">
              <code>
                Enter =SUM(A1:A5), =AVERAGE(B1:B5), =MAX(C1:C5), =MIN(D1:D5), or
                =COUNT(A1:E1) in any cell
              </code>
            </div>
          </div>
          <div>
            <p className="text-xs mb-1">Test Data Quality Functions:</p>
            <div className="text-xs mb-2">
              <code>
                Enter =TRIM(A1), =UPPER(B1), or =LOWER(C1) in any cell
              </code>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xs">
            To test REMOVE_DUPLICATES: Select a range → Click "Remove
            Duplicates"
            <br />
            To test FIND_AND_REPLACE: Select a range → Click "Find & Replace"
          </p>
        </div>
      </div>
    );
  };

  {
    /* Bottom bar */
  }
  const renderBottomBar = () => {
    <div className="flex items-center border-t border-gray-300 bg-gray-100 px-2 py-1">
      <button className="p-1 text-gray-600">+</button>
      <button className="p-1 mx-1 text-gray-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
      <button className="bg-blue-100 text-blue-700 rounded px-3 py-1 mx-2 flex items-center">
        Sheet1 <span className="ml-1">▼</span>
      </button>
    </div>;
  };

  return (
    <div className="flex flex-col w-full h-screen max-h-screen">
      {/* Menu bar */}
      <div className="flex items-center px-4 py-2 border-b border-gray-300">
        <div className="w-8 h-8 bg-green-500 rounded mr-2 flex items-center justify-center">
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg> */}
          <img src={logo} alt="" />
        </div>
        <div className="flex-col">
          <div className="text-gray-700 mr-4 flex items-center">
            <input className="w-[175px] text-lg" value="Untitled spreadsheet" />
            <div className="cursor-pointer hover:bg-gray-300 rounded-full p-1 flex items-center justify-center">
              <StarOutlineIcon sx={{ width: "18px" }} />
            </div>
            <div className="cursor-pointer hover:bg-gray-300 rounded-full p-1 flex items-center justify-center ml-[8px]">
              <DriveFileMoveOutlinedIcon sx={{ width: "18px" }} />
            </div>
            <div className="cursor-pointer hover:bg-gray-300 rounded-full p-1 flex items-center justify-center ml-[8px]">
              <CloudDoneOutlinedIcon sx={{ width: "18px" }} />
            </div>
          </div>
          <div className="flex space-x-4 text-gray-700 text-sm">
            <div>File</div>
            <div>Edit</div>
            <div>View</div>
            <div>Insert</div>
            <div>Format</div>
            <div>Data</div>
            <div>Tools</div>
            <div>Extensions</div>
            <div>Help</div>
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center">
          <div className="cursor-pointer hover:bg-gray-300 rounded-full p-1 flex items-center justify-center">
            <RestoreOutlinedIcon style={{ width: "25px", height: "25px" }} />
          </div>

          <div className="cursor-pointer hover:bg-gray-300 rounded-full p-1 ml-5 flex items-center justify-center">
            <InsertCommentOutlinedIcon style={{ width: "25px", height: "25px" }} />
          </div>

          <div className="cursor-pointer hover:bg-gray-300 rounded-full p-1 ml-5 mr-5 flex items-center justify-center">
            <VideocamOutlinedIcon style={{ width: "25px", height: "25px" }} />
          </div>
          <button className="w-[120px] bg-[#C2E7FF]  rounded-full p-2 flex items-center justify-center font-semibold mr-5">
            <LockOutlinedIcon sx={{width:"20px"}}/>
            <h3 className="ml-2 text-sm ">Share</h3>
          </button>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm">
            A
          </div>
        </div>
      </div>

      {renderToolbar()}
      {renderFormulaBar()}
      {renderGrid()}
      {renderBottomBar()}
      {activeTestPlane && renderTestingPanel()}
    </div>
  );
};

export default Sheets;
