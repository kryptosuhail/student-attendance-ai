import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export default function WeeklyAttendanceTable() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Student</TableCell>
          <TableCell>Mon</TableCell>
          <TableCell>Tue</TableCell>
          <TableCell>Wed</TableCell>
          <TableCell>Thu</TableCell>
          <TableCell>Fri</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Arun</TableCell>
          <TableCell>P</TableCell>
          <TableCell>P</TableCell>
          <TableCell>A</TableCell>
          <TableCell>P</TableCell>
          <TableCell>P</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
