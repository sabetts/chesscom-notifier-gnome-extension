/*
  Copyright (c) 2026, Shawn Betts <sabetts@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the GNOME nor the names of its contributors may be
      used to endorse or promote products derived from this software without
      specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
  ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';
import Soup from 'gi://Soup';
import GLib from 'gi://GLib';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {StatusMenuItem} from './statusMenuItem.js';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init(settings, extension) {
        super._init(0.0, _('Chess.com Notifier'));

        this._settings = settings;
        this._extension = extension;
        this._session = new Soup.Session();
        this._lastData = null;

        this._label = new St.Label({
            text: '♞',
            style_class: 'chesscom-indicator',
        });
        this.add_child(this._label);

        this._gamesItem = new StatusMenuItem('media-playback-start-symbolic', _('Games to move'), '-');
        this.menu.addMenuItem(this._gamesItem);

        this._messagesItem = new StatusMenuItem('mail-unread-symbolic', _('New messages'), '-');
        this.menu.addMenuItem(this._messagesItem);

        this._friendRequestsItem = new StatusMenuItem('avatar-default-symbolic', _('Friend requests'), '-');
        this.menu.addMenuItem(this._friendRequestsItem);

        this._challengesItem = new StatusMenuItem('document-open-recent-symbolic', _('Challenges'), '-');
        this.menu.addMenuItem(this._challengesItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._startTimer();

        this._settingsChangedId = this._settings.connect('changed', () => {
            this._startTimer();
        });

        const item = new PopupMenu.PopupMenuItem(_('Check Now'));
        item.connect('activate', () => {
            this._check();
        });
        this.menu.addMenuItem(item);

        const gamesLinkItem = new PopupMenu.PopupMenuItem(_('Open Daily Games'));
        gamesLinkItem.connect('activate', () => {
            Gio.AppInfo.launch_default_for_uri(
                'https://www.chess.com/daily-chess/games/current',
                null
            );
        });
        this.menu.addMenuItem(gamesLinkItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const settingsItem = new PopupMenu.PopupMenuItem(_('Settings'));
        settingsItem.connect('activate', () => {
            this._extension.openPreferences();
        });
        this.menu.addMenuItem(settingsItem);
    }

    _startTimer() {
        this._removeTimer();
        const interval = this._settings.get_int('polling-interval');
        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            interval,
            () => {
                this._check();
                return GLib.SOURCE_CONTINUE;
            }
        );
        this._check();
    }

    _removeTimer() {
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = null;
        }
    }

    _check() {
        const username = this._settings.get_string('username');
        if (!username) {
            this._label.style = 'color: #555555;';
            this._gamesItem.value = '-';
            this._messagesItem.value = '-';
            this._friendRequestsItem.value = '-';
            this._challengesItem.value = '-';
            return;
        }

        const url = `https://api.chess.com/int/player/${username}/notices`;
        const message = Soup.Message.new('GET', url);

        this._session.send_and_read_async(message, null, null, (session, result) => {
            try {
                const bytes = session.send_and_read_finish(result);

                if (message.status_code !== 200) {
                    this._label.style = 'color: #555555;';
                    const err = message.status_code === 404 ? _('Unknown user') : _(`Error ${message.status_code}`);
                    this._gamesItem.value = err;
                    this._messagesItem.value = err;
                    this._friendRequestsItem.value = err;
                    this._challengesItem.value = err;
                    return;
                }

                const json = JSON.parse(new TextDecoder().decode(bytes.get_data()));
                this._lastData = json;

                this._gamesItem.value = `${json.games_to_move}`;
                this._messagesItem.value = `${json.new_messages}`;
                this._friendRequestsItem.value = `${json.friend_requests}`;
                this._challengesItem.value = `${json.challenge_waiting + json.daily_game_challenges}`;

                const games = this._settings.get_boolean('show-games') && json.games_to_move > 0;
                const messages = this._settings.get_boolean('show-messages') && json.new_messages > 0;
                const friends = this._settings.get_boolean('show-friend-requests') && json.friend_requests > 0;
                const challenges = this._settings.get_boolean('show-challenges') &&
                    (json.challenge_waiting + json.daily_game_challenges) > 0;

                this._label.style = (games || messages || friends || challenges)
                    ? 'color: white;'
                    : 'color: #555555;';
            } catch (e) {
                this._label.style = 'color: #555555;';
                this._gamesItem.value = _('Invalid');
                this._messagesItem.value = _('Invalid');
                this._friendRequestsItem.value = _('Invalid');
                this._challengesItem.value = _('Invalid');
                logError(e, 'Chess.com Notifier');
            }
        });
    }

    destroy() {
        this._session.abort();
        this._removeTimer();
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }
        super.destroy();
    }
});

export default class ChesscomNotifierExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._indicator = new Indicator(this._settings, this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
        this._settings = null;
    }
}
