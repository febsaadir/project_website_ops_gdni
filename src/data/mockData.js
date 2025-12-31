export const USERS = [
  // 5 Super Admin (Sesuai request)
  { email: 'head1@gdn3.com', name: 'Head Office 1', role: 'super_admin', area: 'National' },
  { email: 'head2@gdn3.com', name: 'Head Office 2', role: 'super_admin', area: 'National' },
  { email: 'budi.santoso@gdn3.com', name: 'Budi Santoso', role: 'super_admin', area: 'National' }, // Nama Anda bisa disini
  { email: 'finance@gdn3.com', name: 'Finance Team', role: 'super_admin', area: 'National' },
  { email: 'director@gdn3.com', name: 'Director', role: 'super_admin', area: 'National' },
  
  // Area Admins
  { email: 'admin.jabo1@gdn3.com', name: 'Admin Jabo 1', role: 'area_admin', area: 'Jabo1' },
  { email: 'admin.jabo2@gdn3.com', name: 'Admin Jabo 2', role: 'area_admin', area: 'Jabo2' },
  { email: 'admin.jateng@gdn3.com', name: 'Admin Jateng', role: 'area_admin', area: 'Jateng' },
];

// Fungsi simulasi login
export const mockLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = USERS.find(u => u.email === email);
      // Password dummy: "12345" untuk semua
      if (user && password === '12345') {
        resolve({ success: true, user });
      } else {
        reject({ success: false, message: 'Email tidak terdaftar atau password salah.' });
      }
    }, 1000); // Delay 1 detik biar terasa real
  });
};