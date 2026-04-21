"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  const handleLogout = async () => {
    if (!session?.id_token) {
      await signOut();
      return;
    }
    const keycloakLogoutUrl =
      `http://localhost:8080/realms/kiwi-realm/protocol/openid-connect/logout` +
      `?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}` +
      `&id_token_hint=${session.id_token}`;

    await signOut({ redirect: false });
    window.location.href = keycloakLogoutUrl;
  };

  return (
    <header className="w-full max-w-5xl flex justify-between items-center py-4 px-6 bg-white shadow-sm rounded-2xl mb-8 border border-slate-100">
      <div className="flex flex-col">
        <div className="font-bold text-xl text-blue-900 flex items-center gap-2">
          <span>🥝 KIWI Drones</span>
          {session?.user && (
            <span className="text-xs font-normal bg-slate-100 text-slate-500 px-2 py-1 rounded-md border border-slate-200">
              ID: {session.user.betrieb_id}
            </span>
          )}
        </div>
        {session?.user && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-slate-700">
              {session.user.winery_name}
            </span>
            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                session.user.is_bio
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-amber-100 text-amber-700 border border-amber-200"
              }`}
            >
              {session.user.is_bio ? "Bio-Betrieb" : "Konventionell"}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{session.user.name}</p>
              <p className="text-xs text-slate-500 italic">
                {session.user.roles?.includes("winzer")
                  ? "Winzer"
                  : "Mitarbeiter"}
              </p>
            </div>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`}
              alt="Avatar"
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"
            />
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              Abmelden
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn("keycloak")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
          >
            Anmelden
          </button>
        )}
      </div>
    </header>
  );
}
