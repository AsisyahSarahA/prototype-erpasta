$ErrorActionPreference = 'Stop'
$root = 'd:\KKI\PROEJCT MANAGER\PROTOTYPE\prototype-erpasta'

# Original compact CRM menu (from the old crm Sidebar.js NAV_GROUPS)
$groups = @(
  @{ title = 'CRM & Penjualan';     items = @(@{ id = 'pipeline'; label = 'Sales Pipeline' }, @{ id = 'customers'; label = 'Master Customer' }) },
  @{ title = 'ERP & Delivery';      items = @(@{ id = 'projects'; label = 'Proyek & Delivery' }) },
  @{ title = 'Kontrak & Keuangan';  items = @(@{ id = 'finance_top'; label = 'Invoice & Setting TOP' }, @{ id = 'contracts_legal'; label = 'Kontrak & Legalitas' }) },
  @{ title = 'Client Care & AI';    items = @(@{ id = 'client_care'; label = 'WhatsApp Client Care' }) },
  @{ title = 'Eksekutif';           items = @(@{ id = 'reports'; label = 'Laporan & Analytics' }) }
)

function Build-SubNav([bool]$isJs, [string]$pad) {
  $lines = New-Object System.Collections.Generic.List[string]
  $c = $pad + '  '      # children indent
  $s = $pad + '    '    # span indent
  $lines.Add($pad + '<div class="nav-sub" id="crmSubNav">')
  $first = $true
  foreach ($g in $groups) {
    $lines.Add($c + '<div class="nav-sub-group-title">' + $g.title + '</div>')
    foreach ($it in $g.items) {
      $id = $it.id
      if ($isJs) {
        $href = '${prefix}crm/crm.html#' + $id
        $cond = "activeSubpage === '$id'"
        if ($first) { $cond = "(activeSubpage === '$id' || !activeSubpage)" }
        $cls = 'nav-sub-btn ${activeModule === ''crm'' && ' + $cond + ' ? ''active'' : ''''}'
      } else {
        $href = 'crm/crm.html#' + $id
        $cls = 'nav-sub-btn'
      }
      $lines.Add($c + '<a href="' + $href + '" class="' + $cls + '" data-module="crm" data-sub="' + $id + '" onclick="window.navigateToModuleSubpage(''crm'', ''' + $id + ''', ''' + $href + ''', event)">')
      $lines.Add($s + '<span class="nav-sub-dot"></span>')
      $lines.Add($s + '<span>' + $it.label + '</span>')
      $lines.Add($c + '</a>')
      $first = $false
    }
  }
  $lines.Add($pad + '</div>')
  return ,$lines
}

function Patch-File([string]$path, [bool]$isJs, [string]$pad) {
  $bytes = [IO.File]::ReadAllBytes($path)
  $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
  $raw = [IO.File]::ReadAllText($path)
  $nl = if ($raw.Contains("`r`n")) { "`r`n" } else { "`n" }
  $l = [System.Collections.Generic.List[string]]($raw -split "`r?`n")

  $start = -1
  for ($i = 0; $i -lt $l.Count; $i++) { if ($l[$i] -like '*id="crmSubNav"*') { $start = $i; break } }
  if ($start -lt 0) { throw "crmSubNav not found in $path" }

  $depth = 0; $end = -1
  for ($i = $start; $i -lt $l.Count; $i++) {
    $depth += ([regex]::Matches($l[$i], '<div[\s>]')).Count
    $depth -= ([regex]::Matches($l[$i], '</div>')).Count
    if ($depth -eq 0) { $end = $i; break }
  }
  if ($end -lt 0) { throw "closing div not found in $path" }

  $new = Build-SubNav $isJs $pad
  $l.RemoveRange($start, $end - $start + 1)
  $l.InsertRange($start, $new)

  $enc = New-Object System.Text.UTF8Encoding($hasBom)
  [IO.File]::WriteAllText($path, ($l -join $nl), $enc)
  Write-Output ("{0}: replaced lines {1}-{2} with {3} lines" -f (Split-Path $path -Leaf), ($start + 1), ($end + 1), $new.Count)
}

Patch-File (Join-Path $root 'sidebar.js')   $true  '            '
Patch-File (Join-Path $root 'sidebar.html') $false '      '
