package pl.touk.nussknacker.plugins

import pl.touk.nussknacker.engine.api.process.ProcessName
import pl.touk.nussknacker.restmodel.process.deployment.DeployInfo

sealed trait ChangeEvent

object ChangeEvent {
  final case class OnArchived(processName: ProcessName) extends ChangeEvent
  final case class OnCategoryChanged(processName: ProcessName, category: String) extends ChangeEvent
  final case class OnDeleted(processName: ProcessName) extends ChangeEvent
  final case class OnDeployed(processName: ProcessName, deployInfo: DeployInfo) extends ChangeEvent
  final case class OnRenamed(oldName: ProcessName, newName: ProcessName) extends ChangeEvent
  final case class OnSaved(processName: ProcessName) extends ChangeEvent
  final case class OnUnarchived(processName: ProcessName) extends ChangeEvent
}