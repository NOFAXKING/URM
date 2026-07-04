import { formatDisplayDate, formatLongDate, dateKey } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { ViewUserDialog } from "@/components/admin/view-user-dialog";
import { EmptyState } from "@/components/admin/empty-state";

type UserRow = {
  id: number;
  fullName: string;
  phoneNumber: string;
  bankName: string;
  registrationDate: Date;
  registrationTime: string;
};

export function UsersTable({ users, startIndex }: { users: UserRow[]; startIndex: number }) {
  if (users.length === 0) return <EmptyState />;

  const groups = new Map<string, UserRow[]>();
  for (const user of users) {
    const key = dateKey(user.registrationDate);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(user);
  }

  let runningIndex = startIndex;

  return (
    <div className="divide-y divide-border">
      {Array.from(groups.entries()).map(([key, groupUsers]) => (
        <div key={key}>
          <div className="flex items-center gap-2 bg-muted/40 px-4 py-2.5">
            <Badge variant="secondary" className="font-medium">
              {formatLongDate(groupUsers[0].registrationDate)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {groupUsers.length} registration{groupUsers.length !== 1 ? "s" : ""}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">No.</TableHead>
                <TableHead>Russian Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Registration Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupUsers.map((user) => {
                runningIndex += 1;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="text-muted-foreground">{runningIndex}</TableCell>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell className="tabular-nums">{user.phoneNumber}</TableCell>
                    <TableCell>{user.bankName}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatDisplayDate(user.registrationDate)}
                    </TableCell>
                    <TableCell className="tabular-nums">{user.registrationTime}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <ViewUserDialog
                          user={{
                            fullName: user.fullName,
                            phoneNumber: user.phoneNumber,
                            bankName: user.bankName,
                            displayDate: formatDisplayDate(user.registrationDate),
                            registrationTime: user.registrationTime,
                          }}
                        />
                        <EditUserDialog
                          user={{
                            id: user.id,
                            fullName: user.fullName,
                            phoneNumber: user.phoneNumber,
                            bankName: user.bankName,
                          }}
                        />
                        <DeleteConfirmDialog id={user.id} name={user.fullName} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
