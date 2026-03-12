/**
 * Engly — Синхронизация с Google Sheets
 */

export function createSyncManager(getSyncUrl, setSyncUrl) {
  return {
    // Получить данные из таблицы
    async fetchFromSheet() {
      const url = getSyncUrl();
      if (!url) {
        throw new Error('URL таблицы не настроен');
      }
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.status}`);
      }
      
      const data = await response.json();
      return data.words || [];
    },
    
    // Отправить данные в таблицу
    async pushToSheet(words) {
      const url = getSyncUrl();
      if (!url) {
        throw new Error('URL таблицы не настроен');
      }
      
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ words }),
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    },
    
    // Проверить доступность таблицы
    async testConnection() {
      try {
        await this.fetchFromSheet();
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error.message };
      }
    }
  };
}
