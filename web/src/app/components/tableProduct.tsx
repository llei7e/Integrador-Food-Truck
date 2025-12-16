"use client";

import Status from "./ui/status";
import { getProdutos, Produto } from "@/services/produtos";
import { useState, useEffect } from "react";

interface TableProductProps {
  produtos?: Produto[];
}

export default function TableProduct({ produtos }: TableProductProps) {
  const [data, setData] = useState<Produto[]>(produtos || []);
  const [loading, setLoading] = useState(!produtos);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (produtos) {
      setData(produtos);
      setLoading(false);
      return;
    }

    async function fetchProdutos() {
      try {
        setLoading(true);
        setError(null);
        const fetchedData = await getProdutos();  // 👈 Usa service
        setData(fetchedData);
      } catch (error: unknown) {
        console.error("Erro no fetch de produtos:", error);
        const errMessage = error instanceof Error ? error.message : "Erro desconhecido";
        if (errMessage === "NO_TOKEN" || errMessage === "TOKEN_INVALID") {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        setError(errMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchProdutos();
  }, [produtos]);

  if (loading) {
    return (
      <div className="relative overflow-x-auto mt-2 w-110 rounded-2xl">
        <table className="w-full text-sm text-left rtl:text-right text-white">
          <thead className="text-xs text-white uppercase bg-gray-50 dark:bg-red-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-center">
                Produto
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                Carregando...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-x-auto mt-2 w-110 rounded-2xl">
        <table className="w-full text-sm text-left rtl:text-right text-white">
          <thead className="text-xs text-white uppercase bg-gray-50 dark:bg-red-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-center">
                Produto
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={2} className="px-6 py-4 text-center text-red-500">
                {error}
                <button onClick={() => window.location.reload()} className="ml-2 text-blue-500 underline">
                  Tentar novamente
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto mt-2 w-110 rounded-2xl">
      <table className="w-full text-sm text-left rtl:text-right text-white">
        <thead className="text-xs text-white uppercase bg-gray-50 dark:bg-red-900">
          <tr>
            <th scope="col" className="px-6 py-3 text-center">
              Produto
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((produto) => (
            <tr key={produto.id} className="bg-white border-b border-gray-200">
              <th scope="row" className="px-6 py-4 font-medium text-black whitespace-nowrap">
                {produto.nome}
              </th>
              <td className="px-6 py-4 flex items-center justify-center">
                <Status status={produto.ativo ? "Ativo" : "Inativo"} />
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                Nenhum produto encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}