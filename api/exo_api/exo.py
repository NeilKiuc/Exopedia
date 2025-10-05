from typing import Literal

try:
    # Lazy import of runtime to avoid import errors during certain tooling
    from .model_runtime import get_model
    _model = get_model()
except Exception:
    _model = None


def exo(
    orbital_period: float,
    transit_depth: float,
    duration: float,
    snr: float,
    star_radius: float,
    star_temperature: float,
    star_magnitude: float,
) -> Literal["exo", "candidate", "not exo"]:
    """
    Returns one of: "exo", "candidate", or "not exo" using a lightweight
    runtime model if available, otherwise a simple heuristic fallback.
    """
    # Prefer artifact-backed model
    if _model is not None:
        try:
            return _model.predict(
                orbital_period=orbital_period,
                transit_depth=transit_depth,
                duration=duration,
                snr=snr,
                star_radius=star_radius,
                star_temperature=star_temperature,
                star_magnitude=star_magnitude,
            )
        except Exception:
            # fall back below if artifact fails
            pass

    # Fallback: very simple, transparent rules
    if snr >= 20 and transit_depth >= 500:
        return "exo"
    if snr >= 10 and transit_depth >= 200:
        return "candidate"
    return "not exo"
