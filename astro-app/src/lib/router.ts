/**
 * Simple navigation utility for client-side navigation in Astro
 * Simulates the React Router useNavigate hook
 */

export function useNavigate() {
  return (path: string) => {
    window.location.href = path;
  };
}
