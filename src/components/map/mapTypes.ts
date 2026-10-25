import type { Plan, RoadId, Scenario, WardId } from '../../types'

export interface MapViewProps {
  scenario: Scenario
  plan: Plan
  selectedWardId: WardId | null
  selectedRoadId: RoadId | null
  showRoutes: boolean
  onSelectWard: (wardId: WardId) => void
  onSelectRoad: (roadId: RoadId | null) => void
  onTileFailure: () => void
}
