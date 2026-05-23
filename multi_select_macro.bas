' === Multi-select macro for the "model" column (column L) ===
' Paste this into the code window of the "Archive" sheet
' (Alt+F11 in Excel → double-click "Archive" in the project pane → paste below)

Private Sub Worksheet_Change(ByVal Target As Range)
    Dim rng As Range
    Dim oldVal As String
    Dim newVal As String

    ' Watch only the model column (L), rows 2..1000
    Set rng = Me.Range("L2:L1000")
    If Intersect(Target, rng) Is Nothing Then Exit Sub
    If Target.Count > 1 Then Exit Sub

    Application.EnableEvents = False

    newVal = Target.Value
    Application.Undo
    oldVal = Target.Value
    Target.Value = newVal

    If oldVal <> "" And newVal <> "" And oldVal <> newVal Then
        ' avoid duplicates: check if newVal is already a token in oldVal
        If InStr(1, ", " & oldVal & ", ", ", " & newVal & ", ") = 0 Then
            Target.Value = oldVal & ", " & newVal
        Else
            Target.Value = oldVal
        End If
    End If

    Application.EnableEvents = True
End Sub
