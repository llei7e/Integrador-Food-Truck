import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function OAuthGoogle() {
  const router = useRouter();
  const { completeSocialLogin } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const rawPayload = params.get("payload");

    if (!rawPayload) {
      console.error("Nenhum payload recebido");
      router.replace("/login");
      return;
    }

    try {
      // 1️⃣ Decodifica o JSON vindo do backend
      const decoded = decodeURIComponent(rawPayload);
      const data = JSON.parse(decoded);

      const token = data.access_token;
      const email = data.user?.email;
      const name = data.user?.name;

      if (!token) {
        console.error("Token ausente no payload");
        router.replace("/login");
        return;
      }

      // 2️⃣ Salva o token e o usuário localmente (como o login normal)
      completeSocialLogin(token, email).then(() => {
        // (opcional) salva também o nome no localStorage
        if (name) {
          localStorage.setItem("user_name", name);
        }

        completeSocialLogin(token, email).then(async () => {
            await new Promise((r) => setTimeout(r, 300)); // delay leve, opcional
            router.replace("/home");
            });
            
        // 3️⃣ Redireciona para a home
        router.replace("/home");
      });
    } catch (err) {
      console.error("Erro ao processar payload:", err);
      router.replace("/login");
    }
  }, []);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "sans-serif"
    }}>
      <h2>Concluindo login com Google...</h2>
      <p>Aguarde enquanto finalizamos seu acesso 🔄</p>
    </div>
  );
}
