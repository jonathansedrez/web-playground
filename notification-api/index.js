const permissionButton = document.getElementById("button-permission");
const checkPermissionButton = document.getElementById(
  "button-check-permission"
);
const triggerButton = document.getElementById("button-trigger");

permissionButton.addEventListener("click", () => {
  Notification.requestPermission();
});

checkPermissionButton.addEventListener("click", () => {
  // default - The user hasn't been asked for permission yet, so notifications won't be displayed.
  // granted - The user has granted permission to display notifications, after having been asked previously.
  // denied - The user has explicitly declined permission to show notifications.
  console.log("Notification.permission", Notification.permission);
});

triggerButton.addEventListener("click", () => {
  setTimeout(() => {
    new Notification("This is a notification", {
      body: "Notification description",
    });
  }, 1000);
});
