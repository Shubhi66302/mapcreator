export const addZone = ({ zone_id }) => ({
  type: "ADD-ZONE",
  value: {
    blocked: false,
    paused: false,
    zone_id
  }
});
