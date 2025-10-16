import math
from typing import Tuple


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
	"""Compute great-circle distance in kilometers between two points."""
	R = 6371.0
	phi1 = math.radians(lat1)
	phi2 = math.radians(lat2)
	dphi = math.radians(lat2 - lat1)
	dlambda = math.radians(lon2 - lon1)
	a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
	c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
	return R * c


def kmeans_once(points: list[Tuple[float, float]], k: int, iters: int = 10) -> list[list[int]]:
	"""Simple k-means returning clusters as index lists. Not optimized; fine for small sets."""
	if not points or k <= 0:
		return []
	centroids = points[:k] if len(points) >= k else points + [points[-1]] * (k - len(points))
	clusters: list[list[int]] = [[] for _ in range(k)]
	for _ in range(iters):
		clusters = [[] for _ in range(k)]
		for idx, p in enumerate(points):
			dists = [haversine_km(p[0], p[1], c[0], c[1]) for c in centroids]
			ci = dists.index(min(dists))
			clusters[ci].append(idx)
		# recompute centroids
		new_centroids = []
		for cluster in clusters:
			if not cluster:
				new_centroids.append(centroids[0])
				continue
			lat = sum(points[i][0] for i in cluster) / len(cluster)
			lon = sum(points[i][1] for i in cluster) / len(cluster)
			new_centroids.append((lat, lon))
		centroids = new_centroids
	return clusters


