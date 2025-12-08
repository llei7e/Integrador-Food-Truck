export async function getPedidos() {
  const response = await fetch("http://localhost:8080/api/pedidos", {
    method: "GET",
    headers: {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlhdCI6MTc2NTIzMjk5OSwiZXhwIjoxNzY1MzE5Mzk5fQ.h2wR794ljEFMuxOUIbAvYbihk8W2901U6FVwk-G4g6U", // <-- com Bearer
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar pedidos");
  }

  return await response.json();
}
