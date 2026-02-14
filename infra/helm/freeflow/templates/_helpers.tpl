{{- define "freeflow.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "freeflow.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name (include "freeflow.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "freeflow.componentFullname" -}}
{{- $root := index . 0 -}}
{{- $name := index . 1 -}}
{{- printf "%s-%s" (include "freeflow.fullname" $root) $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "freeflow.componentServiceAccountName" -}}
{{- $root := index . 0 -}}
{{- $name := index . 1 -}}
{{- $component := index . 2 -}}
{{- if $component.serviceAccount.name -}}
{{- $component.serviceAccount.name -}}
{{- else if $component.serviceAccount.create -}}
{{- include "freeflow.componentFullname" (list $root $name) -}}
{{- else -}}
{{- "default" -}}
{{- end -}}
{{- end -}}
