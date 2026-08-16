import grpc from '@grpc/grpc-js';
import * as widgetMapper from '../mappers/widgetMapper.js';

export function createWidgetService({ pool, widgetsRepo }) {
  return {
    async GetWidgetContent(call, callback) {
      try {
        const ids = call.request.widgetIds ?? [];
        const found = await widgetsRepo.findByIds(pool, ids);
        const widgets = ids.filter((id) => found.has(id)).map((id) => widgetMapper.toWidgetContent(found.get(id)));
        const notFoundWidgetIds = ids.filter((id) => !found.has(id));
        callback(null, { widgets, notFoundWidgetIds });
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    // Reserved for future server-streaming push -- see widget.proto.
    SubscribeWidgetUpdates(call) {
      call.emit('error', { code: grpc.status.UNIMPLEMENTED, message: 'not implemented yet' });
    },
  };
}
