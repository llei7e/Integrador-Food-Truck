"use client";

import { useState, useEffect } from "react";
import Button from "./ui/button";
import UserModal from "./userModal";

interface User {
  id?: number;
  nome: string;
  email: string;
  cargo: string; // Admin, Cliente, Chapeiro ou outro
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Token de autenticação ausente.");
        return;
      }

      const response = await fetch(`${API_BASE}/api/usuarios`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar usuários: ${response.status}`);
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Erro ao carregar usuários:", err);
      setError(err.message || "Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Token de autenticação ausente.");
          return;
        }

        const response = await fetch(`${API_BASE}/api/usuarios/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Erro ao deletar usuário: ${response.status}`);
        }

        // Refresh list
        fetchUsers();
      } catch (err: any) {
        console.error("Erro ao deletar usuário:", err);
        setError(err.message || "Falha ao deletar usuário.");
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleAddOrUpdateUser = async (newUser: User, password?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Token de autenticação ausente.");
        return;
      }

      let response;
      if (editingUser) {
        response = await fetch(`${API_BASE}/api/usuarios/${editingUser.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nome: newUser.nome, email: newUser.email, cargo: newUser.cargo }),
        });
      } else {

        response = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ nome: newUser.nome, email: newUser.email, password, cargo: newUser.cargo }),
        });
      }

      if (!response.ok) {
        throw new Error(`Erro ao ${editingUser ? 'atualizar' : 'criar'} usuário: ${response.status}`);
      }

      // Refresh list
      fetchUsers();
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      console.error("Erro ao salvar usuário:", err);
      setError(err.message || "Falha ao salvar usuário.");
    }
  };

  if (loading) {
    return <div className="p-6"><p>Carregando usuários...</p></div>;
  }

  if (error) {
    return <div className="p-6"><p className="text-red-500">{error}</p></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Usuários</h1>
        <Button text="Criar Usuário" onClick={() => setIsModalOpen(true)} />
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.cargo === 'ADMIN' ? 'bg-green-100 text-green-800' 
                    : user.cargo === 'Chapeiro' ? 'bg-yellow-100 text-yellow-800'
                    : user.cargo === 'Cliente' ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'  // Qualquer outro cargo
                  }`}>
                    {user.cargo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(user.id!)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
          onSave={(newUser) => handleAddOrUpdateUser(newUser)}
        />
      )}
    </div>
  );
}