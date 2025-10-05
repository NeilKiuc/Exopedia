export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({ status: "ok" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = (req.body || {});
    const data = Array.isArray(body.data) ? body.data : [];

    const exo = (
      orbital_period,
      transit_depth,
      duration,
      snr,
      star_radius,
      star_temperature,
      star_magnitude
    ) => {
      // Placeholder logic (matches original behavior)
      return "not exo";
    };

    const predictions = data.map((item) => ({
      name: item?.name,
      label: exo(
        Number(item?.orbital_period),
        Number(item?.transit_depth),
        Number(item?.transit_duration),
        Number(item?.signal_to_noise_ratio),
        Number(item?.stellar_radius),
        Number(item?.stellar_temperature),
        Number(item?.stellar_magnitude)
      ),
    }));

    return res.status(200).json({
      success: true,
      predictions,
      insights: [],
      recommendations: [],
      anomalies: [],
      model_version: body?.model_name || "api-1.0.0",
      timestamp: Date.now() / 1000,
      processing_time: 0,
    });
  } catch (e) {
    return res.status(500).json({ error: `Batch inference error: ${e?.message || e}` });
  }
}
