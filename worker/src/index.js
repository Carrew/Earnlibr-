export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({
        success: true,
        service: "earnlibr-notifications",
        status: "healthy",
        timestamp: new Date().toISOString()
      });
    }

    return Response.json(
      {
        success: false,
        error: "Not Found"
      },
      {
        status: 404
      }
    );
  }
};
