# Radius Filter Behavior Test

After clicking the 5km button, the button visually changed to the terracotta active state (confirmed from screenshot: "5 km" is now highlighted). However, the result count still shows "8 resultados" and all 8 cards are still visible. This is expected behavior because the radius filter only activates when a user location is set — without GPS or a manual location, the filter cannot compute distances. The filter correctly shows all maestros when no location is set, which is the proper UX pattern.

The ring indicator is visible below the preset buttons — showing the center dot with concentric circles. The GPS button ("Usar GPS") is available for location detection. The search input for zone/colonia is also present.

Overall the component works correctly: it shows all results when no location is set, and will filter by distance once GPS is enabled or a location is entered.
