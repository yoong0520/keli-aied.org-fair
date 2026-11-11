/**
 * KELI 2026 전공박람회 「나에게 딱 맞는 한림 AI 찾기」 참여기록 수신용 Apps Script
 * Apps Script 만들기: https://script.new  (또는 참여기록 시트 → 확장 프로그램 → Apps Script)
 * 사용법: 이 코드를 붙여넣기 → 저장 → 배포 → 새 배포 → 웹 앱
 *         (실행 사용자: 나 / 액세스 권한: 모든 사용자) → 배포된 웹 앱 URL(…/exec)을 게임 운영 도구에 입력
 * 게임 HTML의 SYNC_KEY 값과 아래 KEY 값이 같아야 기록이 저장된다.
 */
const KEY = 'keli-c1697a0b0b4692ec';
const SHEET_ID = '';   // 참여기록 시트 ID (비워 두면 이 스크립트가 붙은 시트를 사용)

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    if (body.key !== KEY) return out_({ ok: false, error: 'invalid key' });
    const sh = (SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet()).getSheets()[0];
    const last = sh.getLastRow();
    const seen = new Set(last > 1 ? sh.getRange(2, 1, last - 1, 1).getValues().flat().map(String) : []);
    const rows = [], ids = [];
    const recs = (body.records || []).slice(0, 50);              // 한 번에 최대 50건
    recs.forEach(function (r) {
      if (!valid_(r)) return;                                     // 형식이 맞지 않는 데이터는 저장하지 않음
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

const RESULTS = ['HAI-Tutor','HAI-GPT','HAI-Way','HAI-PBL','HAI-Forum','HAI-MathTutor','HAI-Coder','HAI-BDPI','HAI-Sync'];
function valid_(r) {
  if (!r || typeof r !== 'object') return false;
  if (!/^T[A-Z0-9]{5}-[a-z0-9]{6,12}$/.test(String(r.id))) return false;       // 게임이 만드는 기록ID 형식
  if (r.sid && !/^\d{7,10}$/.test(String(r.sid))) return false;                  // 학번 7~10자리 숫자
  if (RESULTS.indexOf(r.result) < 0 || RESULTS.indexOf(r.second) < 0) return false;
  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(String(r.time))) return false;
  if (!Array.isArray(r.answers) || r.answers.length !== 5 || r.answers.some(function (x) { return String(x).length > 60; })) return false;
  if (typeof r.secs !== 'number' || r.secs < 0 || r.secs > 3600) return false;
  if (String(r.type || '').length > 20 || !/^T[A-Z0-9]{5}$/.test(String(r.device))) return false;
  return true;
}

function doGet() {
  return out_({ ok: true, ping: 'KELI fair sheet ready' });
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
