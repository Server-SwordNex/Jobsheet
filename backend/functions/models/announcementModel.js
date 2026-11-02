const createAnnouncementModel = ({
  announcementId,
  title,
  message,
  type,
  target,
  priority,
}) => {
  return {
    announcementId: announcementId || null,

    title: title || "",
    message: message || "",

    type: type || "General",
    target: target || "All Users",
    priority: priority || "Medium",

    status: "Active",
    isDeleted: false,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const updateAnnouncementModel = (data) => {
  return {
    ...data,
    updatedAt: new Date().toISOString(),
  };
};

export {
  createAnnouncementModel,
  updateAnnouncementModel,
};