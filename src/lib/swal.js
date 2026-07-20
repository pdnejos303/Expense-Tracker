import Swal from 'sweetalert2';

// Toast notification
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export function showToast(message, icon = 'success') {
  Toast.fire({ icon, title: message });
}

// Confirm dialog
export function showConfirm({ title, text, confirmButtonText, cancelButtonText }) {
  return Swal.fire({
    title: title || '',
    text: text || '',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: confirmButtonText || 'OK',
    cancelButtonText: cancelButtonText || 'Cancel',
    reverseButtons: true,
  });
}
