// src/app/admin/page.tsx
import Header from "@/components/header";
import UsersTable from "@/components/usersTable";

export default function AdminPage() {
  return (
    <div className="mr-4 ml-4">
      <Header />
        <main className="min-h-screen p-8">
        
        <div className="max-w-7xl mx-auto">
            <UsersTable />
        </div>
        </main>
    </div>
  );
}