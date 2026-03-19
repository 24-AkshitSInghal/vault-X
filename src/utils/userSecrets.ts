export function getUserSecret(username: string): string | null {
  // Your target common secret
  const commonSecret = 'C7AND3YSGTIFOFCTRZE7TL2VEEF52ARP';

  // Check if the username matches the pattern 'vaultx-NUM'
  const match = username.match(/^vaultx-(\d+)$/i);

  if (match) {
    const id = parseInt(match[1], 10);
    // If the ID falls perfectly within the 101 to 300 range inclusive, grant them the key
    if (id >= 101 && id <= 300) {
      return commonSecret;
    }
  }

  // You can easily add exceptions for specific users here, for example:
  // if (username === 'admin') return 'ADMIN_SECRET_HERE';

  // If no conditions are met, the user is unknown
  return null;
}
