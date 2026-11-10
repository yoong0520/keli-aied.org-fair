/**
 * KELI 2026 전공박람회 「나에게 딱 맞는 한림 AI 찾기」 참여기록 수신용 Apps Script
 * 사용법: 참여기록 시트 → 확장 프로그램 → Apps Script → 이 코드를 붙여넣기 → 배포 → 새 배포 → 웹 앱
 *         (실행 사용자: 나 / 액세스 권한: 모든 사용자) → 배포된 웹 앱 URL(…/exec)을 게임 운영 도구에 입력
 * 게임 HTML의 SYNC_KEY 값과 아래 KEY 값이 같아야 기록이 저장된다.
 */
const KEY = 'keli-c1697a0b0b4692ec';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.key !== KEY) return out_({ ok: false, error: 'invalid key' });
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    const last = sh.getLastRow();
    const seen = new Set(last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().flat().map(String) : []);
    const rows = [], ids = [];
    (body.records || []).forEach(function (r) {
      ids.push(r.id);
      if (seen.has(String(r.id))) return;           // 같은 기록이 다시 와도 한 번만 저장
      seen.add(String(r.id));
      const a = (r.answers || []).concat(['', '', '', '', '']).slice(0, 5);
      rows.push([r.id, r.time, r.sid ? "'" + r.sid : '', r.consent ? '동의' : '미입력',
                 r.result, r.type, r.second, a[0], a[1], a[2], a[3], a[4],
                 r.secs, r.dup ? '중복' : '', r.device, new Date()]);
    });
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    return out_({ ok: true, saved: rows.length, ids: ids });
  } catch (err) {
    return out_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return out_({ ok: true, ping: 'KELI fair sheet ready' });
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
