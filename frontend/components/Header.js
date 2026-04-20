"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    if (!session?.id_token) {
      // Fallback: if we don't have a token, just log out locally
      console.warn("No ID token found, performing local logout only.");
      await signOut();
      return;
    }

    const keycloakLogoutUrl =
      `http://localhost:8080/realms/kiwi-realm/protocol/openid-connect/logout` +
      `?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}` +
      `&id_token_hint=${session.id_token}`;

    // Log out of Next-Auth and redirect to Keycloak
    await signOut({ redirect: false });
    window.location.href = keycloakLogoutUrl;
  };

  return (
    <header className="w-full max-w-5xl flex justify-between items-center py-4 px-6 bg-white shadow-sm rounded-2xl mb-8">
      <div className="font-bold text-xl text-blue-900">🥝 KIWI Drones</div>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{session?.user?.name}</p>
              <p className="text-xs text-slate-500">
                {session?.user?.roles?.includes("winzer")
                  ? "Winzer"
                  : "Mitarbeiter"}
              </p>
              <pre>{JSON.stringify(session?.user?.roles, null, 2)}</pre>
            </div>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.email}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"
            />
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:text-red-800"
            >
              Abmelden
            </button>
            <pre>
              {JSON.stringify(
                {
                  roles: session?.user?.roles,
                  betrieb_id: session?.user?.betrieb_id, // This should now show 101
                },
                null,
                2,
              )}
            </pre>
          </>
        ) : (
          <button
            onClick={() => signIn("keycloak")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            Anmelden
          </button>
        )}
      </div>
    </header>
  );
}
