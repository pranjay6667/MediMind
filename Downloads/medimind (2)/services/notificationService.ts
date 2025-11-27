
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendNotification = (title: string, body: string) => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        // In a real PWA, you would set a proper icon path here
        icon: 'https://cdn-icons-png.flaticon.com/512/3022/3022272.png', 
        requireInteraction: true // Keeps notification on screen until user interacts
      });
    } catch (e) {
      console.error("Notification failed", e);
    }
  } else {
    console.log("Notification permission not granted");
  }
};
